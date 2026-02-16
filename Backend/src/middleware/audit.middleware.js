const { AuditLog } = require('../models');

/**
 * @param {String} action
 * @param {String} entityType
 * @param {Model} Model (Sequelize model)
 */
exports.auditAction = (action, entityType, Model = null) => {
  return async (req, res, next) => {
    let oldData = null;

    // ============================
    // 1️⃣ CAPTURE OLD DATA (BEFORE)
    // ============================
    if (Model && req.params.id) {
      try {
        const record = await Model.findByPk(req.params.id);
        if (record) {
          oldData = record.toJSON();
        }
      } catch (err) {
        console.error('Audit OLD data fetch failed:', err.message);
      }
    }

    // Save old data in request
    req.auditOldData = oldData;

    // ============================
    // 2️⃣ AFTER RESPONSE — LOG AUDIT
    // ============================
    res.on('finish', async () => {
      try {
        // Log ONLY successful mutations
        if (res.statusCode < 200 || res.statusCode >= 300) return;

        await AuditLog.create({
          userId: req.user?.id || null,
          role: req.user?.role || null,
          action,
          entityType,
          entityId: req.params.id || null,
          oldData: req.auditOldData,
          newData: req.body || null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      } catch (err) {
        console.error('Audit log write failed:', err.message);
      }
    });

    next();
  };
};
