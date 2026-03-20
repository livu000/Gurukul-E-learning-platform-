const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  teacherId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'teacher_id' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  subtitle: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT('long') },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'draft', validate: { isIn: [['draft', 'review', 'published', 'rejected']] } },
  approvalStatus: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending', field: 'approval_status', validate: { isIn: [['pending', 'approved', 'rejected']] } },
  approvedBy: { type: DataTypes.BIGINT.UNSIGNED, field: 'approved_by' },
  approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
  rejectionReason: { type: DataTypes.TEXT, field: 'rejection_reason' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  isPaid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_paid' },
  currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'INR' },
  category: { type: DataTypes.STRING(100) },
  level: { type: DataTypes.STRING(20) },
  language: { type: DataTypes.STRING(50) },
  thumbnailUrl: { type: DataTypes.STRING(255), field: 'thumbnail_url' },
  totalDurationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'total_duration_minutes' },
  avgRating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0, field: 'avg_rating' },
  ratingCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'rating_count' },
  enrollCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'enroll_count' }
}, {
  tableName: 'courses',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { name: 'idx_courses_teacher', fields: [{ name: 'teacher_id' }] },
    { name: 'idx_courses_status', fields: [{ name: 'status' }] },
    { name: 'idx_courses_approval', fields: [{ name: 'approval_status' }] },
    { name: 'idx_courses_category', fields: [{ name: 'category' }] },
    { name: 'idx_courses_price', fields: [{ name: 'price' }] },
    { name: 'idx_courses_teacher_status', fields: [{ name: 'teacher_id' }, { name: 'status' }] },
    {
      name: 'idx_courses_search',
      type: 'FULLTEXT',
      fields: [{ name: 'title' }, { name: 'subtitle' }, { name: 'description' }]
    }
  ]
});

module.exports = Course;
