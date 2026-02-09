const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enrollment = sequelize.define(
  'Enrollment',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM('active', 'cancelled'),
      defaultValue: 'active'
    },

    enrolled_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'enrollments',
    timestamps: false
  }
);

module.exports = Enrollment;
