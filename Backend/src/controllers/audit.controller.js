const { AuditLog } = require('../models');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};
