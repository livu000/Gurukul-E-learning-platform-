const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssignmentGrade = sequelize.define('AssignmentGrade', {
  submissionId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'submission_id'
  },
  marksAwarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'marks_awarded'
  },
  feedback: {
    type: DataTypes.TEXT
  },
  gradedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'graded_by'
  },
  gradedAt: {
    type: DataTypes.DATE,
    field: 'graded_at'
  }
}, {
  tableName: 'assignment_grades',
  timestamps: false
});

module.exports = AssignmentGrade;
