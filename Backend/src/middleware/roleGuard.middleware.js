exports.preventRoleEscalation = (req, res, next) => {
  if (req.body.role) {
    return res.status(403).json({
      message: 'Role modification not allowed'
    });
  }

  next();
};
