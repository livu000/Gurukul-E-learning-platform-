const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  certificateUid: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'certificate_uid' },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  courseId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'course_id' },
  enrollmentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'enrollment_id' },
  issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'issued_at' },
  certificateUrl: { type: DataTypes.STRING(255), field: 'certificate_url' },
  verificationCode: { type: DataTypes.STRING(100), allowNull: false, field: 'verification_code' },
  isValid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_valid' },
  userNameSnapshot: { type: DataTypes.STRING(120), field: 'user_name_snapshot' },
  courseTitleSnapshot: { type: DataTypes.STRING(255), field: 'course_title_snapshot' }
}, {
  tableName: 'certificates',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Certificate;
