const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'user_id'
    },
    token: DataTypes.TEXT,
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at'
    }
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = RefreshToken;
