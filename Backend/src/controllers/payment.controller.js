const {
  Payment,
  Transaction,
  Invoice,
  Course,
  Enrollment
} = require('../models');


// ==========================================
// CREATE PAYMENT INTENT
// ==========================================
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId required' });
    }

    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // ✅ VERY IMPORTANT FIX — camelCase property
    if (!course.isPaid) {
      return res.status(400).json({
        message: 'Free course — use enrollment directly'
      });
    }

    // Check already enrolled
    const already = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (already) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    // Create payment
    const payment = await Payment.create({
      userId,
      courseId,
      amount: course.price,
      status: 'pending'
    });

    return res.status(201).json(payment);

  } catch (err) {
    console.error('createPayment error:', err);
    return res.status(500).json({ message: 'Failed to create payment' });
  }
};


// ==========================================
// VERIFY PAYMENT (MOCK SUCCESS FLOW)
// ==========================================
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, gatewayData } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: 'paymentId required' });
    }

    const payment = await Payment.findByPk(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'success') {
      return res.status(400).json({
        message: 'Payment already verified'
      });
    }

    // 1️⃣ Update payment
    payment.status = 'success';
    payment.providerPaymentId = gatewayData?.payment_id || null;
    await payment.save();

    // 2️⃣ Log transaction
    await Transaction.create({
      paymentId: payment.id,
      gatewayResponse: gatewayData || {},
      status: 'success'
    });

    // 3️⃣ Auto enrollment
    await Enrollment.create({
      userId: payment.userId,
      courseId: payment.courseId
    });

    // 4️⃣ Create invoice
    const invoiceNumber = `INV-${Date.now()}`;

    await Invoice.create({
      paymentId: payment.id,
      invoiceNumber,
      userId: payment.userId,
      courseId: payment.courseId,
      amount: payment.amount
    });

    return res.json({
      message: 'Payment verified and enrollment created',
      payment
    });

  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ message: 'Failed to verify payment' });
  }
};


// ==========================================
// GET MY PAYMENTS
// ==========================================
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.findAll({
      where: { userId },
      order: [['created_at', 'DESC']]
    });

    return res.json(payments);

  } catch (err) {
    console.error('getMyPayments error:', err);
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
};
