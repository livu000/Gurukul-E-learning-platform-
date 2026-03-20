const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizAnswer = sequelize.define('QuizAnswer', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  attemptId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'attempt_id' },
  questionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'question_id' },
  selectedOptionId: { type: DataTypes.BIGINT.UNSIGNED, field: 'selected_option_id' },
  answerText: { type: DataTypes.TEXT, field: 'answer_text' },
  isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_correct' },
  marksAwarded: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0, field: 'marks_awarded' },
  answeredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'answered_at' }
}, {
  tableName: 'quiz_answers',
  underscored: true,
  timestamps: false
});

module.exports = QuizAnswer;
