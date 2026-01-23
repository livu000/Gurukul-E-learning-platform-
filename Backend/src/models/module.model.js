const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Module = sequelize.define('Module', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'course_id'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    field: 'sort_order',
    defaultValue: 1
  }
}, {
  tableName: 'modules',
  timestamps: false
});

module.exports = Module;
 