const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LessonProgress = sequelize.define(
  'LessonProgress',
  {
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id'
    },

    lessonId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'lesson_id'
    },

    courseId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'course_id'
    },

    status: {
      type: DataTypes.ENUM('started', 'completed'),
      defaultValue: 'started'
    },

    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    }
  },
  {
    tableName: 'lesson_progress',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = LessonProgress;
