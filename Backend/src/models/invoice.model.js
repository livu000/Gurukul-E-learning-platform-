const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define(
  'Invoice',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    paymentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'payment_id'
    },

    invoiceNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'invoice_number'
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id'
    },

    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'course_id'
    },

    amount: {
      type: DataTypes.DECIMAL(10,2)
    },

    // ✅ IMPORTANT — MAP issued_at
    issuedAt: {
      type: DataTypes.DATE,
      field: 'issued_at'
    }
  },
  {
    tableName: 'invoices',

    // ❗ VERY IMPORTANT FIX
    timestamps: false   // prevents Sequelize from trying created_at
  }
);

module.exports = Invoice;
