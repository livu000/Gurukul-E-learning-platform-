const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'student', validate: { isIn: [['admin', 'teacher', 'student']] } },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'blocked', 'inactive']] } },
  profileImage: { type: DataTypes.STRING(255), field: 'profile_image' },
  bio: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING(20) },
  lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { name: 'idx_users_role', fields: [{ name: 'role' }] },
    { name: 'idx_users_status', fields: [{ name: 'status' }] }
  ]
});

module.exports = User;
