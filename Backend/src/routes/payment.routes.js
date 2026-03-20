const router = require('express').Router();

const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const controller = require('../controllers/payment.controller');

router.post(
  '/create',
  authenticate,
  authorizeRoles('student'),
  controller.createPayment
);

router.post(
  '/verify',
  authenticate,
  authorizeRoles('student'),
  controller.verifyPayment
);

router.get(
  '/my',
  authenticate,
  authorizeRoles('student', 'admin'),
  controller.getMyPayments
);

router.get(
  '/admin',
  authenticate,
  authorizeRoles('admin'),
  controller.getAllPayments
);

router.post(
  '/:paymentId/refund',
  authenticate,
  authorizeRoles('admin'),
  controller.refundPayment
);

router.get(
  '/:paymentId/invoice',
  authenticate,
  controller.downloadInvoice
);

module.exports = router;
