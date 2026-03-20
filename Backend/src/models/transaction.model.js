const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  paymentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'payment_id' },
  provider: { type: DataTypes.STRING(50), allowNull: false },
  eventType: { type: DataTypes.STRING(100), allowNull: false, field: 'event_type' },
  providerOrderId: { type: DataTypes.STRING(255), field: 'provider_order_id' },
  providerPaymentId: { type: DataTypes.STRING(255), field: 'provider_payment_id' },
  providerEventId: { type: DataTypes.STRING(255), field: 'provider_event_id' },
  requestPayload: { type: DataTypes.JSON, field: 'request_payload' },
  responsePayload: { type: DataTypes.JSON, field: 'response_payload' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'received', validate: { isIn: [['received', 'processed', 'failed']] } },
  errorMessage: { type: DataTypes.TEXT, field: 'error_message' },
  errorCode: { type: DataTypes.STRING(100), field: 'error_code' },
  isProcessed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_processed' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  processedAt: { type: DataTypes.DATE, field: 'processed_at' }
}, {
  tableName: 'transactions',
  underscored: true,
  timestamps: false
});

module.exports = Transaction;
