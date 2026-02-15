const router = require('express').Router();

const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const controller = require('../controllers/payment.controller');


// ==========================================
// STUDENT PAYMENT ROUTES
// ==========================================

// Create payment intent
router.post(
  '/create',
  authenticate,
  authorizeRoles('student'),
  controller.createPayment
);

// Verify payment (mock for now)
router.post(
  '/verify',
  authenticate,
  authorizeRoles('student'),
  controller.verifyPayment
);

// Get my payments history
router.get(
  '/my',
  authenticate,
  authorizeRoles('student'),
  controller.getMyPayments
);

module.exports = router;
