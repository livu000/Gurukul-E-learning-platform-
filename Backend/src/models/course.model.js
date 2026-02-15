const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT
    },

    status: {
      type: DataTypes.ENUM('draft', 'review', 'published'),
      defaultValue: 'draft'
    },

    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'teacher_id'
    },

    // ✅ ADD THIS
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0
    },

    // ✅ ADD THIS (VERY IMPORTANT)
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'is_paid'
    }

  },
  {
    tableName: 'courses',
    timestamps: false
  }
);

module.exports = Course;
