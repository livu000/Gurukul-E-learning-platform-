const crypto = require('crypto');
const { Op } = require('sequelize');
const { Course, Enrollment, Invoice, Payment, Transaction, User } = require('../models');
const sequelize = require('../config/db');
const { buildSimplePdf } = require('../utils/document.util');

function buildInvoicePdf(invoice, payment, course, user) {
  const invoiceDate = new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return buildSimplePdf({
    title: `Invoice ${invoice.invoiceNumber}`,
    lines: [
      `Billing Name: ${invoice.billingName || user?.name || 'Student'}`,
      `Billing Email: ${invoice.billingEmail || user?.email || 'Not provided'}`,
      `Course: ${course?.title || `Course ${invoice.courseId}`}`,
      `Invoice Date: ${invoiceDate}`,
      `Payment Reference: ${payment?.transactionRef || payment?.providerPaymentId || 'Pending'}`,
      `Base Amount: ${invoice.currency || 'INR'} ${invoice.baseAmount}`,
      `GST Amount: ${invoice.currency || 'INR'} ${invoice.gstAmount || 0}`,
      `Total Amount: ${invoice.currency || 'INR'} ${invoice.totalAmount}`,
      `Status: ${invoice.status}`
    ]
  });
}

exports.createPayment = async (req, res) => {
  try {
    const courseId = Number(req.body.courseId);
    if (!courseId) {
      return res.status(400).json({ message: 'courseId required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Only published courses can be purchased' });
    }

    if (!course.isPaid) {
      return res.status(400).json({ message: 'Free course - use direct enrollment' });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        courseId,
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({ message: 'Already enrolled' });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      courseId,
      amount: course.price,
      currency: course.currency || 'INR',
      paymentProvider: req.body.paymentProvider || 'mock',
      providerOrderId: req.body.providerOrderId || `order_${Date.now()}`,
      status: 'pending',
      transactionRef: crypto.randomUUID()
    });

    return res.status(201).json(payment);
  } catch (err) {
    console.error('createPayment error:', err);
    return res.status(500).json({ message: 'Failed to create payment' });
  }
};

exports.verifyPayment = async (req, res) => {
  const tx = await sequelize.transaction();

  try {
    const paymentId = Number(req.body.paymentId);
    if (!paymentId) {
      throw new Error('paymentId required');
    }

    const payment = await Payment.findByPk(paymentId, { transaction: tx });
    if (!payment) {
      await tx.rollback();
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (Number(payment.userId) !== Number(req.user.id)) {
      await tx.rollback();
      return res.status(403).json({ message: 'You are not allowed to verify this payment' });
    }

    if (payment.status === 'success') {
      await tx.rollback();
      return res.json({ message: 'Payment already verified', payment });
    }

    const course = await Course.findByPk(payment.courseId, { transaction: tx });
    const user = await User.findByPk(payment.userId, { transaction: tx });
    const gatewayData = req.body.gatewayData || {};

    await payment.update(
      {
        status: 'success',
        providerPaymentId: gatewayData.payment_id || payment.providerPaymentId || `pay_${Date.now()}`
      },
      { transaction: tx }
    );

    await Transaction.create(
      {
        paymentId: payment.id,
        provider: payment.paymentProvider || 'mock',
        eventType: gatewayData.event_type || 'payment.captured',
        providerOrderId: payment.providerOrderId,
        providerPaymentId: payment.providerPaymentId,
        providerEventId: gatewayData.event_id || crypto.randomUUID(),
        requestPayload: gatewayData,
        responsePayload: { paymentId: payment.id, status: 'success' },
        status: 'processed',
        isProcessed: true,
        processedAt: new Date()
      },
      { transaction: tx }
    );

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { userId: payment.userId, courseId: payment.courseId },
      defaults: {
        userId: payment.userId,
        courseId: payment.courseId,
        isPaid: true,
        paymentId: payment.id,
        status: 'active'
      },
      transaction: tx
    });

    if (!enrollment.paymentId) {
      await enrollment.update(
        { isPaid: true, paymentId: payment.id, status: 'active' },
        { transaction: tx }
      );
    }

    if (created) {
      await course.update(
        { enrollCount: Number(course.enrollCount || 0) + 1 },
        { transaction: tx }
      );
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(payment.id).padStart(6, '0')}`;
    await Invoice.findOrCreate({
      where: { paymentId: payment.id },
      defaults: {
        paymentId: payment.id,
        userId: payment.userId,
        courseId: payment.courseId,
        invoiceNumber,
        billingName: user?.name || 'Student',
        billingEmail: user?.email || null,
        baseAmount: payment.amount,
        gstRate: 0,
        gstAmount: 0,
        totalAmount: payment.amount,
        currency: payment.currency,
        status: 'paid'
      },
      transaction: tx
    });

    await tx.commit();
    return res.json({ message: 'Payment verified and enrollment created', payment });
  } catch (err) {
    console.error('verifyPayment error:', err);
    await tx.rollback();
    return res.status(500).json({ message: err.message || 'Failed to verify payment' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'price', 'currency'] },
        { model: Invoice, as: 'invoice' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(
      payments.map((payment) => ({
        ...payment.toJSON(),
        invoiceDownloadPath: payment.invoice ? `/api/payments/${payment.id}/invoice` : null
      }))
    );
  } catch (err) {
    console.error('getMyPayments error:', err);
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.paymentId, {
      include: [
        { model: Invoice, as: 'invoice' },
        { model: Course, as: 'course', attributes: ['id', 'title'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!payment || !payment.invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const isOwner = Number(payment.userId) === Number(req.user.id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not allowed to download this invoice' });
    }

    const pdf = buildInvoicePdf(payment.invoice, payment, payment.course, payment.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${payment.invoice.invoiceNumber}.pdf"`);
    return res.send(pdf);
  } catch (err) {
    console.error('downloadInvoice error:', err);
    return res.status(500).json({ message: 'Failed to download invoice' });
  }
};
