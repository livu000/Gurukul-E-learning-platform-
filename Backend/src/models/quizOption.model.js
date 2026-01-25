const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizOption = sequelize.define('QuizOption', {
  questionId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'question_id'
  },

  optionText: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_text'
  },

  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_correct'
  }
}, {
  tableName: 'quiz_options',
  timestamps: false
});

module.exports = QuizOption;
