const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizAnswer = sequelize.define('QuizAnswer', {
  attemptId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'attempt_id'
  },

  questionId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'question_id'
  },

  selectedOptionId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'selected_option_id'
  },

  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_correct'
  }
}, {
  tableName: 'quiz_answers',
  timestamps: false
});

module.exports = QuizAnswer;
