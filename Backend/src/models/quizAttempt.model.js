const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizAttempt = sequelize.define('QuizAttempt', {
  quizId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'quiz_id'
  },

  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'student_id'
  },

  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  startedAt: {
    type: DataTypes.DATE,
    field: 'started_at'
  },

  submittedAt: {
    type: DataTypes.DATE,
    field: 'submitted_at'
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: false
});

module.exports = QuizAttempt;
