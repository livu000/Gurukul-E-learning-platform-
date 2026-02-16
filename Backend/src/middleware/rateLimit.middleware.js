const rateLimit = require('express-rate-limit');

// ===============================
// GLOBAL API LIMITER
// ===============================
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // max requests per IP
  message: {
    message: 'Too many requests, slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});


// ===============================
// LOGIN LIMITER (STRICTER)
// ===============================
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, //change to 10 after development 
  message: {
    message: 'Too many login attempts. Try again later.'
  }
});
