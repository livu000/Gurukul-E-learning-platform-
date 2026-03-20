const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'user_id' },
  role: { type: DataTypes.STRING(50) },
  action: { type: DataTypes.STRING(255), allowNull: false },
  entityType: { type: DataTypes.STRING(100), field: 'entity_type' },
  entityId: { type: DataTypes.BIGINT.UNSIGNED, field: 'entity_id' },
  oldData: { type: DataTypes.JSON, field: 'old_data' },
  newData: { type: DataTypes.JSON, field: 'new_data' },
  ipAddress: { type: DataTypes.STRING(100), field: 'ip_address' },
  userAgent: { type: DataTypes.TEXT, field: 'user_agent' },
  status: { type: DataTypes.STRING(20), defaultValue: 'success' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' }
}, {
  tableName: 'audit_logs',
  underscored: true,
  timestamps: false
});

module.exports = AuditLog;
