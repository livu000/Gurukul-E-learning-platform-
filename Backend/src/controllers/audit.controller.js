const { Op } = require('sequelize');
const { AuditLog, User } = require('../models');

exports.getAuditLogs = async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) where.userId = req.query.userId;
    if (req.query.action) where.action = { [Op.like]: `%${req.query.action}%` };
    if (req.query.entityType) where.entityType = req.query.entityType;
    if (req.query.status) where.status = req.query.status;

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(req.query.limit || 100), 500)
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};
