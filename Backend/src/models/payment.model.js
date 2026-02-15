
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define(
  "Payment",
  {
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },

    courseId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "course_id",
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "INR",
    },

    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending",
    },

    paymentProvider: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "payment_provider",
    },

    providerOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "provider_order_id",
    },

    providerPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "provider_payment_id",
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Payment;
