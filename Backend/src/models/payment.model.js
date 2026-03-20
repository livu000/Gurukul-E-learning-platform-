const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'INR' },
  paymentProvider: { type: DataTypes.STRING(50), field: 'payment_provider' },
  providerOrderId: { type: DataTypes.STRING(255), field: 'provider_order_id' },
  providerPaymentId: { type: DataTypes.STRING(255), field: 'provider_payment_id' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending', validate: { isIn: [['pending', 'success', 'failed', 'refunded']] } },
  transactionRef: { type: DataTypes.STRING(255), unique: true, field: 'transaction_ref' },
  refundedAt: { type: DataTypes.DATE, field: 'refunded_at' }
}, {
  tableName: 'payments',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_payment_user', fields: [{ name: 'user_id' }] },
    { name: 'idx_payment_course', fields: [{ name: 'course_id' }] },
    { name: 'idx_payment_status', fields: [{ name: 'status' }] },
    { name: 'idx_payment_provider', fields: [{ name: 'provider_payment_id' }] }
  ]
});

module.exports = Payment;
