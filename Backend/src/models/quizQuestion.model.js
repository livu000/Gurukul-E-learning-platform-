const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizQuestion = sequelize.define('QuizQuestion', {
  quizId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'quiz_id'
  },

  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text'
  },

  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },

  sortOrder: {
    type: DataTypes.INTEGER,
    field: 'sort_order',
    defaultValue: 1
  }
}, {
  tableName: 'quiz_questions',
  timestamps: false
});

module.exports = QuizQuestion;
