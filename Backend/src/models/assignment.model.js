const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Assignment = sequelize.define('Assignment', {
  courseId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'course_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'max_marks'
  },
  dueDate: {
    type: DataTypes.DATE,
    field: 'due_date'
  },
  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'created_by'
  }
}, {
  tableName: 'assignments',
  timestamps: false
});

module.exports = Assignment;
