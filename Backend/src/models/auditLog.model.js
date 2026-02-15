const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'user_id'
    },

    role: {
      type: DataTypes.STRING
    },

    action: {
      type: DataTypes.STRING,
      allowNull: false
    },

    entityType: {
      type: DataTypes.STRING,
      field: 'entity_type'
    },

    entityId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'entity_id'
    },

    oldData: {
      type: DataTypes.JSON,
      field: 'old_data'
    },

    newData: {
      type: DataTypes.JSON,
      field: 'new_data'
    },

    ipAddress: {
      type: DataTypes.STRING,
      field: 'ip_address'
    },

    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent'
    }
  },
  {
    tableName: 'audit_logs',
    timestamps: false,
    createdAt: false,
    updatedAt: false
  }
);

module.exports = AuditLog;
