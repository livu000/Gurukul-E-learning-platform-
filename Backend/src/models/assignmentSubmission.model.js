const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  assignmentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'assignment_id'
  },
  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'student_id'
  },
  answerText: {
    type: DataTypes.TEXT,
    field: 'answer_text'
  },
  fileUrl: {
    type: DataTypes.STRING,
    field: 'file_url'
  },
  submittedAt: {
    type: DataTypes.DATE,
    field: 'submitted_at'
  }
}, {
  tableName: 'assignment_submissions',
  timestamps: false
});

module.exports = AssignmentSubmission;
