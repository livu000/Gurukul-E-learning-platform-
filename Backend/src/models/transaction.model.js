const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define(
  "Transaction",
  {
    paymentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "payment_id",
    },

    gatewayResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "gateway_response",
    },

    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Transaction;
