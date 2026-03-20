const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  paymentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true, field: 'payment_id' },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  invoiceNumber: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'invoice_number' },
  invoiceDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'invoice_date' },
  billingName: { type: DataTypes.STRING(150), allowNull: false, field: 'billing_name' },
  billingEmail: { type: DataTypes.STRING(191), field: 'billing_email' },
  billingAddress: { type: DataTypes.TEXT, field: 'billing_address' },
  billingState: { type: DataTypes.STRING(100), field: 'billing_state' },
  billingCountry: { type: DataTypes.STRING(100), defaultValue: 'India', field: 'billing_country' },
  billingPincode: { type: DataTypes.STRING(20), field: 'billing_pincode' },
  gstNumber: { type: DataTypes.STRING(50), field: 'gst_number' },
  isGstApplied: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_gst_applied' },
  baseAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'base_amount' },
  gstRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, field: 'gst_rate' },
  gstAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'gst_amount' },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_amount' },
  currency: { type: DataTypes.STRING(10), defaultValue: 'INR' },
  invoiceUrl: { type: DataTypes.STRING(255), field: 'invoice_url' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'generated', validate: { isIn: [['generated', 'paid', 'cancelled', 'refunded']] } }
}, {
  tableName: 'invoices',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Invoice;
