const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enrollment = sequelize.define(
  'Enrollment',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id'   // ✅ VERY IMPORTANT
    },

    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'course_id' // ✅ VERY IMPORTANT
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },

    enrolledAt: {
      type: DataTypes.DATE,
      field: 'enrolled_at'
    }
  },
  {
    tableName: 'enrollments',
    timestamps: false
  }
);

module.exports = Enrollment;
