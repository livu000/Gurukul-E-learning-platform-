const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
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
  authController.refreshToken   // ✅ fixed typo
);

module.exports = router;
