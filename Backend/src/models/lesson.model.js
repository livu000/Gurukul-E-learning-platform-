const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  moduleId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'module_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT('long') },
  videoUrl: { type: DataTypes.STRING(255), field: 'video_url' },
  attachmentUrl: { type: DataTypes.STRING(255), field: 'attachment_url' },
  lessonType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'text', field: 'lesson_type', validate: { isIn: [['video', 'text', 'file', 'live']] } },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'duration_minutes' },
  isPreview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_preview' },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'sort_order' },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_published' },
  videoProvider: { type: DataTypes.STRING(50), field: 'video_provider' },
  videoDurationSeconds: { type: DataTypes.INTEGER, defaultValue: 0, field: 'video_duration_seconds' }
}, {
  tableName: 'lessons',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { name: 'idx_lessons_module', fields: [{ name: 'module_id' }] },
    { name: 'idx_lessons_module_order', fields: [{ name: 'module_id' }, { name: 'sort_order' }] },
    { name: 'idx_lessons_preview', fields: [{ name: 'is_preview' }] }
  ]
});

module.exports = Lesson;
