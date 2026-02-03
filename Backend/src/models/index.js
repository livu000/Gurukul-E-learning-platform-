const sequelize = require('../config/db');

// Core models
const User = require('./user.model');
const Course = require('./course.model');
const Module = require('./module.model');
const Lesson = require('./lesson.model');
const LessonProgress = require('./lessonProgress.model');

// Quiz models
const Quiz = require('./quiz.model');
const QuizQuestion = require('./quizQuestion.model');
const QuizOption = require('./quizOption.model');
const QuizAttempt = require('./quizAttempt.model');
const QuizAnswer = require('./quizAnswer.model');

// Assignment models
const Assignment = require('./assignment.model');
const AssignmentSubmission = require('./assignmentSubmission.model');
const AssignmentGrade = require('./assignmentGrade.model');


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

// (Assignments & quizzes associations will be handled in controllers)


// Exports

module.exports = {
  sequelize,

  User,
  Course,
  Module,
  Lesson,
  LessonProgress,

  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  QuizAnswer,

  Assignment,
  AssignmentSubmission,
  AssignmentGrade
};
