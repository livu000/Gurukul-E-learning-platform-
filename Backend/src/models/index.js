const sequelize = require('../config/db');
const User = require('./user.model');
const Course = require('./course.model');

// associations (example)
User.hasMany(Course, { foreignKey: 'teacherId' });
Course.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

module.exports = { sequelize, User, Course };
