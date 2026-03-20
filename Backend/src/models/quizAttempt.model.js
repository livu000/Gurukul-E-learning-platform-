const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  quizId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'quiz_id' },
  studentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'student_id' },
  attemptNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'attempt_number' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'in_progress', validate: { isIn: [['in_progress', 'submitted', 'evaluated', 'expired']] } },
  startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'started_at' },
  submittedAt: { type: DataTypes.DATE, field: 'submitted_at' },
  timeSpentSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'time_spent_seconds' },
  score: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
  totalMarks: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0, field: 'total_marks' },
  isPassed: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_passed' },
  evaluatedAt: { type: DataTypes.DATE, field: 'evaluated_at' }
}, {
  tableName: 'quiz_attempts',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = QuizAttempt;
