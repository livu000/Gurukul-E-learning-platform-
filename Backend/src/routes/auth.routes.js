const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/rateLimit.middleware');

// ===============================
// LOGIN (Protected by rate limit)
// ===============================
router.post(
  '/login',
  loginLimiter,        // ✅ fixed spelling
  authController.login
);


// ===============================
// REFRESH TOKEN
// ===============================
router.post(
  '/refresh',
  authController.refreshToken
);

router.get(
  '/me',
  authenticate,
  authController.me
);

router.get(
  '/sessions',
  authenticate,
  authController.getSessions
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll
);

module.exports = router;
