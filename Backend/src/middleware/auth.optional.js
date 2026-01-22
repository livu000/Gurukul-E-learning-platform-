const jwt = require('jsonwebtoken');

exports.optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;

  // No token → allow request as public
  if (!header) {
    req.user = null;
    return next();
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch (err) {
    req.user = null;
  }

  next();
};
