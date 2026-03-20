const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LessonProgress = sequelize.define('LessonProgress', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  lessonId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'lesson_id' },
  lastWatchedSecond: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'last_watched_second' },
  totalWatchedSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'total_watched_seconds' },
  isCompleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_completed' },
  completedAt: { type: DataTypes.DATE, field: 'completed_at' },
  lastAccessedAt: { type: DataTypes.DATE, field: 'last_accessed_at', defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.VIRTUAL,
    get() { return this.getDataValue('isCompleted') ? 'completed' : 'started'; },
    set(value) {
      const completed = value === 'completed';
      this.setDataValue('isCompleted', completed);
      this.setDataValue('completedAt', completed ? (this.getDataValue('completedAt') || new Date()) : null);
    }
  }
}, {
  tableName: 'lesson_progress',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'uq_progress_user_lesson',
      unique: true,
      fields: [{ name: 'user_id' }, { name: 'lesson_id' }]
    },
    { name: 'idx_progress_user', fields: [{ name: 'user_id' }] },
    { name: 'idx_progress_course', fields: [{ name: 'course_id' }] },
    { name: 'idx_progress_lesson', fields: [{ name: 'lesson_id' }] },
    { name: 'idx_progress_completion', fields: [{ name: 'is_completed' }] }
  ]
});

module.exports = LessonProgress;
