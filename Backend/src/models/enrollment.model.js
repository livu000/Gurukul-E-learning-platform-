const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  isPaid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_paid' },
  paymentId: { type: DataTypes.BIGINT.UNSIGNED, field: 'payment_id' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'completed', 'cancelled', 'refunded']] } },
  progressPercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'progress_percentage' },
  lastAccessedLessonId: { type: DataTypes.BIGINT.UNSIGNED, field: 'last_accessed_lesson_id' },
  completedAt: { type: DataTypes.DATE, field: 'completed_at' },
  certificateIssued: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'certificate_issued' },
  enrolledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'enrolled_at' }
}, {
  tableName: 'enrollments',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Enrollment;
