const jwt = require('jsonwebtoken');
exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Invalid token' });
  }
};
