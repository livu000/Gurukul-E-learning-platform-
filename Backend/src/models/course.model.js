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
  deletedAt: 'deleted_at'
});

module.exports = Course;
