const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'created_by' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT('long') },
  instructions: { type: DataTypes.TEXT('long') },
  allowTextSubmission: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'allow_text_submission' },
  allowFileSubmission: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'allow_file_submission' },
  maxFileSizeMb: { type: DataTypes.INTEGER, defaultValue: 10, field: 'max_file_size_mb' },
  maxMarks: { type: DataTypes.INTEGER, allowNull: false, field: 'max_marks' },
  passingMarks: { type: DataTypes.INTEGER, defaultValue: 0, field: 'passing_marks' },
  dueDate: { type: DataTypes.DATE, field: 'due_date' },
  lateSubmissionAllowed: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'late_submission_allowed' },
  latePenaltyPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, field: 'late_penalty_percent' },
  maxAttempts: { type: DataTypes.INTEGER, defaultValue: 1, field: 'max_attempts' },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_published' }
}, {
  tableName: 'assignments',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { name: 'idx_assignment_course', fields: [{ name: 'course_id' }] },
    { name: 'idx_assignment_creator', fields: [{ name: 'created_by' }] },
    { name: 'idx_assignment_due_date', fields: [{ name: 'due_date' }] },
    { name: 'idx_assignment_publish', fields: [{ name: 'is_published' }] }
  ]
});

module.exports = Assignment;
