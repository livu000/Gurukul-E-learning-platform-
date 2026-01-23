const sequelize = require('../config/db');

const User = require('./user.model');
const Course = require('./course.model');
const Module = require('./module.model');
const Lesson = require('./lesson.model');
// Associations
User.hasMany(Course, {
  foreignKey: 'teacher_id',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Course.belongsTo(User, { foreignKey: 'teacher_id' });

Course.hasMany(Module, { foreignKey: 'course_id' });
Module.belongsTo(Course, { foreignKey: 'course_id' });

Module.hasMany(Lesson, { foreignKey: 'module_id' });
Lesson.belongsTo(Module, { foreignKey: 'module_id' });

module.exports = {
  sequelize,
  User,
  Course,
  Module,
  Lesson
};
