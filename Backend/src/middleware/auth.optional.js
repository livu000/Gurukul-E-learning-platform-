const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    req.user = null;
    return next();
  }

  const token = header.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'name', 'email', 'role', 'status']
    });

    req.user = user && user.status === 'active'
      ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
      : null;
  } catch (err) {
    req.user = null;
  }

  return next();
};
