const { AuditLog } = require('../models');

exports.auditAction = (action, entityType) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        // Only log successful actions
        if (res.statusCode < 200 || res.statusCode >= 300) return;

        await AuditLog.create({
          userId: req.user?.id || null,
          role: req.user?.role || null,
          action,
          entityType,
          entityId: req.params.id || req.body.id || null,
          newData: req.body || null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      } catch (err) {
        console.error('Audit log failed:', err.message);
      }
    });

    next();
  };
};
