const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssignmentGrade = sequelize.define('AssignmentGrade', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  submissionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'submission_id' },
  gradedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'graded_by' },
  marksAwarded: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0, field: 'marks_awarded' },
  feedback: { type: DataTypes.TEXT('long') },
  rubricJson: { type: DataTypes.JSON, field: 'rubric_json' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'graded', validate: { isIn: [['graded', 'revised', 'regraded']] } },
  gradedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'graded_at' },
  lastUpdatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'last_updated_at' },
  version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  deletedAt: { type: DataTypes.DATE, field: 'deleted_at' }
}, {
  tableName: 'assignment_grades',
  underscored: true,
  timestamps: false,
  indexes: [
    {
      name: 'uq_grade_submission',
      unique: true,
      fields: [{ name: 'submission_id' }]
    },
    { name: 'idx_grades_submission', fields: [{ name: 'submission_id' }] },
    { name: 'idx_grades_teacher', fields: [{ name: 'graded_by' }] },
    { name: 'idx_grades_status', fields: [{ name: 'status' }] }
  ]
});

module.exports = AssignmentGrade;
