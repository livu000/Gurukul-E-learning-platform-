const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'created_by' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  timeLimitMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'time_limit_minutes' },
  totalMarks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'total_marks' },
  passingMarks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'passing_marks' },
  maxAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'max_attempts' },
  allowRetake: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'allow_retake' },
  shuffleQuestions: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'shuffle_questions' },
  showResultsImmediately: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'show_results_immediately' },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_published' },
  availableFrom: { type: DataTypes.DATE, field: 'available_from' },
  availableTo: { type: DataTypes.DATE, field: 'available_to' },
  timeLimit: { type: DataTypes.VIRTUAL, get() { return this.getDataValue('timeLimitMinutes'); }, set(value) { this.setDataValue('timeLimitMinutes', value); } }
}, {
  tableName: 'quizzes',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Quiz;
