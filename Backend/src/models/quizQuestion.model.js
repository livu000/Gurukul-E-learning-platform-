const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizQuestion = sequelize.define('QuizQuestion', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  quizId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'quiz_id' },
  questionText: { type: DataTypes.TEXT('long'), allowNull: false, field: 'question_text' },
  questionType: { type: DataTypes.STRING(20), allowNull: false, field: 'question_type', validate: { isIn: [['mcq', 'true_false', 'short_answer']] } },
  correctTextAnswer: { type: DataTypes.TEXT, field: 'correct_text_answer' },
  explanation: { type: DataTypes.TEXT },
  marks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'sort_order' },
  isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_required' }
}, {
  tableName: 'quiz_questions',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = QuizQuestion;
