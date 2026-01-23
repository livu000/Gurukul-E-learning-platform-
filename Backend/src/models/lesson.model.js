const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lesson = sequelize.define('Lesson', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: DataTypes.TEXT,
  videoUrl: {
    type: DataTypes.STRING,
    field: 'video_url'
  },
  moduleId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'module_id'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    field: 'sort_order',
    defaultValue: 1
  }
}, {
  tableName: 'lessons',
  timestamps: false
});

module.exports = Lesson;
