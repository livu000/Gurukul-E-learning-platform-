const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  certificate_id: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'certificates',
  timestamps: false,
});

module.exports = Certificate;
