const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  assignmentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'assignment_id' },
  studentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'student_id' },
  attemptNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'attempt_number' },
  answerText: { type: DataTypes.TEXT('long'), field: 'answer_text' },
  fileUrl: { type: DataTypes.STRING(255), field: 'file_url' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'submitted', validate: { isIn: [['submitted', 'late', 'graded', 'resubmitted']] } },
  submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'submitted_at' },
  isLate: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_late' },
  marksAwarded: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0, field: 'marks_awarded' },
  gradedAt: { type: DataTypes.DATE, field: 'graded_at' }
}, {
  tableName: 'assignment_submissions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AssignmentSubmission;
