const {
  Payment,
  Transaction,
  Invoice,
  Course,
  Enrollment
} = require('../models');

const sequelize = require('../config/db');


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

    // Course must be paid
    if (!course.isPaid) {
      return res.status(400).json({
        message: 'Free course — use enrollment directly'
      });
    }

    // Prevent duplicate enrollment
    const already = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (already) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    // Create payment intent
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
// VERIFY PAYMENT (TX + IDEMPOTENCY SAFE)
// ==========================================
exports.verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { paymentId, gatewayData } = req.body;

    if (!paymentId) {
      await t.rollback();
      return res.status(400).json({ message: 'paymentId required' });
    }

    const payment = await Payment.findByPk(paymentId, {
      transaction: t
    });

    if (!payment) {
      await t.rollback();
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Prevent double verification
    if (payment.status === 'success') {
      await t.rollback();
      return res.status(400).json({
        message: 'Payment already verified'
      });
    }

    // 🔒 IDEMPOTENCY PROTECTION (Gateway duplicate webhook guard)
    if (gatewayData?.payment_id) {
      const existing = await Payment.findOne({
        where: { providerPaymentId: gatewayData.payment_id },
        transaction: t
      });

      if (existing) {
        await t.rollback();
        return res.status(409).json({
          message: 'Duplicate gateway verification detected'
        });
      }
    }

    // 1️⃣ Update payment
    payment.status = 'success';
    payment.providerPaymentId = gatewayData?.payment_id || null;

    await payment.save({ transaction: t });

    // 2️⃣ Transaction log
    await Transaction.create(
      {
        paymentId: payment.id,
        gatewayResponse: gatewayData || {},
        status: 'success'
      },
      { transaction: t }
    );

    // 3️⃣ Auto enrollment
    await Enrollment.create(
      {
        userId: payment.userId,
        courseId: payment.courseId
      },
      { transaction: t }
    );

    // 4️⃣ Invoice creation
    const invoiceNumber = `INV-${Date.now()}`;

    await Invoice.create(
      {
        paymentId: payment.id,
        invoiceNumber,
        userId: payment.userId,
        courseId: payment.courseId,
        amount: payment.amount
      },
      { transaction: t }
    );

    // ✅ Commit all DB changes
    await t.commit();

    return res.json({
      message: 'Payment verified and enrollment created',
      payment
    });

  } catch (err) {
    console.error('verifyPayment TX error:', err);

    await t.rollback();

    return res.status(500).json({
      message: 'Failed to verify payment'
    });
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
    return res.status(500).json({
      message: 'Failed to fetch payments'
    });
  }
};
