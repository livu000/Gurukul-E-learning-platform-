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
// Certificate + Enrollment models
// ==============================
const Certificate = require('./certificate.model');
const Enrollment = require('./enrollment.model');

// ==============================
// Payment models (FEATURE 5.1)
// ==============================
const Payment = require('./payment.model');
const Transaction = require('./transaction.model');
const Invoice = require('./invoice.model');
const AuditLog = require('./auditLog.model');
const RefreshToken = require('./refreshToken.model');

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

// ---------- Lesson Progress ----------
Course.hasMany(LessonProgress, {
  foreignKey: 'course_id'
});
LessonProgress.belongsTo(Course, {
  foreignKey: 'course_id'
});

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

// ---------- Enrollment ----------
User.hasMany(Enrollment, {
  foreignKey: 'user_id'
});
Enrollment.belongsTo(User, {
  foreignKey: 'user_id'
});

Course.hasMany(Enrollment, {
  foreignKey: 'course_id'
});
Enrollment.belongsTo(Course, {
  foreignKey: 'course_id'
});

// ======================================================
// 💳 PAYMENT ASSOCIATIONS (NEW)
// ======================================================

// User ↔ Payments
User.hasMany(Payment, {
  foreignKey: 'user_id'
});
Payment.belongsTo(User, {
  foreignKey: 'user_id'
});

// Course ↔ Payments
Course.hasMany(Payment, {
  foreignKey: 'course_id'
});
Payment.belongsTo(Course, {
  foreignKey: 'course_id'
});

// Payment ↔ Transactions
Payment.hasMany(Transaction, {
  foreignKey: 'payment_id'
});
Transaction.belongsTo(Payment, {
  foreignKey: 'payment_id'
});

// Payment ↔ Invoice (1:1)
Payment.hasOne(Invoice, {
  foreignKey: 'payment_id'
});
Invoice.belongsTo(Payment, {
  foreignKey: 'payment_id'
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

  // Certificate + Enrollment
  Certificate,
  Enrollment,

  // Payment
  Payment,
  Transaction,
  Invoice,
  AuditLog,
  RefreshToken
};
