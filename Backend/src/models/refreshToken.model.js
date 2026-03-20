const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  tokenHash: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: 'token_hash' },
  deviceInfo: { type: DataTypes.STRING(255), field: 'device_info' },
  ipAddress: { type: DataTypes.STRING(100), field: 'ip_address' },
  userAgent: { type: DataTypes.TEXT, field: 'user_agent' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  revokedAt: { type: DataTypes.DATE, field: 'revoked_at' },
  replacedByTokenHash: { type: DataTypes.STRING(255), field: 'replaced_by_token_hash' }
}, {
  tableName: 'refresh_tokens',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_rt_user', fields: [{ name: 'user_id' }] },
    { name: 'idx_rt_expires', fields: [{ name: 'expires_at' }] },
    { name: 'idx_rt_revoked', fields: [{ name: 'revoked_at' }] }
  ]
});

module.exports = RefreshToken;
