const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Module = sequelize.define('Module', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'sort_order' },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_published' },
  totalDurationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'total_duration_minutes' },
  lessonCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'lesson_count' }
}, {
  tableName: 'modules',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { name: 'idx_modules_course', fields: [{ name: 'course_id' }] },
    { name: 'idx_modules_course_order', fields: [{ name: 'course_id' }, { name: 'sort_order' }] }
  ]
});

module.exports = Module;
