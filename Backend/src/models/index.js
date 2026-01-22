const sequelize = require('../config/db');

const User = require('./user.model');
const Course = require('./course.model');

// Associations
User.hasMany(Course, {
  foreignKey: 'teacher_id',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Course.belongsTo(User, { foreignKey: 'teacher_id' });

module.exports = {
  sequelize,
  User,
  Course
};
