const sequelize = require('../config/db');

// ==============================
// Core models
// ==============================
const User = require('./user.model');
const Course = require('./course.model');
const Module = require('./module.model');
const Lesson = require('./lesson.model');
const LessonProgress = require('./lessonProgress.model');

// ==============================
// Quiz models
// ==============================
const Quiz = require('./quiz.model');
const QuizQuestion = require('./quizQuestion.model');
const QuizOption = require('./quizOption.model');
const QuizAttempt = require('./quizAttempt.model');
const QuizAnswer = require('./quizAnswer.model');

// ==============================
// Assignment models
// ==============================
const Assignment = require('./assignment.model');
const AssignmentSubmission = require('./assignmentSubmission.model');
const AssignmentGrade = require('./assignmentGrade.model');

// ==============================
// Certificate model
// ==============================
const Certificate = require('./certificate.model');

// ======================================================
// ASSOCIATIONS
// ======================================================

// ---------- Users & Courses ----------
User.hasMany(Course, {
  foreignKey: 'teacher_id',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Course.belongsTo(User, {
  foreignKey: 'teacher_id'
});

// ---------- Courses → Modules ----------
Course.hasMany(Module, {
  foreignKey: 'course_id'
});
Module.belongsTo(Course, {
  foreignKey: 'course_id'
});

// ---------- Modules → Lessons ----------
Module.hasMany(Lesson, {
  foreignKey: 'module_id'
});
Lesson.belongsTo(Module, {
  foreignKey: 'module_id'
});

// ---------- Lesson Progress (CRITICAL FIX) ----------
/**
 * This association is REQUIRED for:
 * - Teacher Dashboard
 * - Student progress aggregation
 * - Course-level analytics
 */
Course.hasMany(LessonProgress, {
  foreignKey: 'course_id'
});
LessonProgress.belongsTo(Course, {
  foreignKey: 'course_id'
});

// (Optional but safe — lesson-level tracking)
Lesson.hasMany(LessonProgress, {
  foreignKey: 'lesson_id'
});
LessonProgress.belongsTo(Lesson, {
  foreignKey: 'lesson_id'
});

// ---------- Certificates ----------
User.hasMany(Certificate, {
  foreignKey: 'user_id'
});
Certificate.belongsTo(User, {
  foreignKey: 'user_id'
});

Course.hasMany(Certificate, {
  foreignKey: 'course_id'
});
Certificate.belongsTo(Course, {
  foreignKey: 'course_id'
});

// ---------- Quizzes ----------
Quiz.belongsTo(Course, {
  foreignKey: 'course_id'
});
Course.hasMany(Quiz, {
  foreignKey: 'course_id'
});

Quiz.hasMany(QuizQuestion, {
  foreignKey: 'quiz_id'
});
QuizQuestion.belongsTo(Quiz, {
  foreignKey: 'quiz_id'
});

QuizQuestion.hasMany(QuizOption, {
  foreignKey: 'question_id'
});
QuizOption.belongsTo(QuizQuestion, {
  foreignKey: 'question_id'
});

Quiz.hasMany(QuizAttempt, {
  foreignKey: 'quiz_id'
});
QuizAttempt.belongsTo(Quiz, {
  foreignKey: 'quiz_id'
});

QuizAttempt.hasMany(QuizAnswer, {
  foreignKey: 'attempt_id'
});
QuizAnswer.belongsTo(QuizAttempt, {
  foreignKey: 'attempt_id'
});

// ---------- Assignments ----------
Assignment.belongsTo(Course, {
  foreignKey: 'course_id'
});
Course.hasMany(Assignment, {
  foreignKey: 'course_id'
});

Assignment.hasMany(AssignmentSubmission, {
  foreignKey: 'assignment_id'
});
AssignmentSubmission.belongsTo(Assignment, {
  foreignKey: 'assignment_id'
});

AssignmentSubmission.hasOne(AssignmentGrade, {
  foreignKey: 'submission_id'
});
AssignmentGrade.belongsTo(AssignmentSubmission, {
  foreignKey: 'submission_id'
});

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  sequelize,

  // Core
  User,
  Course,
  Module,
  Lesson,
  LessonProgress,

  // Quiz
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  QuizAnswer,

  // Assignment
  Assignment,
  AssignmentSubmission,
  AssignmentGrade,

  // Certificate
  Certificate
};
