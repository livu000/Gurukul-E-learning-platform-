const rateLimit = require('express-rate-limit');

const parseLimit = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// ===============================
// GLOBAL API LIMITER
// ===============================
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000000, // 15 minutes
  max: parseLimit(process.env.API_RATE_LIMIT_MAX, 300),
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
  windowMs: 15 * 60 * 1000000,
  max: parseLimit(process.env.LOGIN_RATE_LIMIT_MAX, 5),
  message: {
    message: 'Too many login attempts. Try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
