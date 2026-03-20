const { AuditLog } = require('../models');

exports.auditAction = (action, entityType, Model = null) => async (req, res, next) => {
  let oldData = null;
  if (Model && req.params.id) {
    try {
      const record = await Model.findByPk(req.params.id);
      if (record) oldData = record.toJSON();
    } catch (err) {
      console.error('Audit OLD data fetch failed:', err.message);
    }
  }
  req.auditOldData = oldData;
  res.on('finish', async () => {
    try {
      if (res.statusCode < 200 || res.statusCode >= 300) return;
      await AuditLog.create({
        userId: req.user?.id || null,
        role: req.user?.role || 'system',
        action,
        entityType,
        entityId: req.params.id || null,
        oldData: req.auditOldData,
        newData: req.body || null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        status: 'success'
      });
    } catch (err) {
      console.error('Audit log write failed:', err.message);
    }
  });
  next();
};
