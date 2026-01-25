const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Quiz = sequelize.define('Quiz', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT
  },

  courseId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'course_id'
  },

  timeLimit: {
    type: DataTypes.INTEGER,
    field: 'time_limit'
  },

  totalMarks: {
    type: DataTypes.INTEGER,
    field: 'total_marks',
    defaultValue: 0
  },

  isPublished: {
    type: DataTypes.BOOLEAN,
    field: 'is_published',
    defaultValue: false
  },

  createdBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'created_by'
  },

  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  }
}, {
  tableName: 'quizzes',
  timestamps: false
});

module.exports = Quiz;

