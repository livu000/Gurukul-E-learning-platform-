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
  as: 'courses',
  foreignKey: 'teacherId',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Course.belongsTo(User, {
  as: 'teacher',
  foreignKey: 'teacherId'
});

// ---------- Courses → Modules ----------
Course.hasMany(Module, {
  as: 'modules',
  foreignKey: 'courseId'
});
Module.belongsTo(Course, {
  as: 'course',
  foreignKey: 'courseId'
});

// ---------- Modules → Lessons ----------
Module.hasMany(Lesson, {
  as: 'lessons',
  foreignKey: 'moduleId'
});
Lesson.belongsTo(Module, {
  as: 'module',
  foreignKey: 'moduleId'
});

// ---------- Lesson Progress ----------
Course.hasMany(LessonProgress, {
  as: 'progressRecords',
  foreignKey: 'courseId'
});
LessonProgress.belongsTo(Course, {
  as: 'course',
  foreignKey: 'courseId'
});

Lesson.hasMany(LessonProgress, {
  as: 'progressRecords',
  foreignKey: 'lessonId'
});
LessonProgress.belongsTo(Lesson, {
  as: 'lesson',
  foreignKey: 'lessonId'
});

// ---------- Certificates ----------
User.hasMany(Certificate, {
  as: 'certificates',
  foreignKey: 'user_id'
});
Certificate.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id'
});

Course.hasMany(Certificate, {
  as: 'certificates',
  foreignKey: 'course_id'
});
Certificate.belongsTo(Course, {
  as: 'course',
  foreignKey: 'course_id'
});

// ---------- Quizzes ----------
Quiz.belongsTo(Course, {
  as: 'course',
  foreignKey: 'courseId'
});
Course.hasMany(Quiz, {
  as: 'quizzes',
  foreignKey: 'courseId'
});

Quiz.hasMany(QuizQuestion, {
  as: 'questions',
  foreignKey: 'quizId'
});
QuizQuestion.belongsTo(Quiz, {
  as: 'quiz',
  foreignKey: 'quizId'
});

QuizQuestion.hasMany(QuizOption, {
  as: 'options',
  foreignKey: 'questionId'
});
QuizOption.belongsTo(QuizQuestion, {
  as: 'question',
  foreignKey: 'questionId'
});

Quiz.hasMany(QuizAttempt, {
  as: 'attempts',
  foreignKey: 'quizId'
});
QuizAttempt.belongsTo(Quiz, {
  as: 'quiz',
  foreignKey: 'quizId'
});

QuizAttempt.hasMany(QuizAnswer, {
  as: 'answers',
  foreignKey: 'attemptId'
});
QuizAnswer.belongsTo(QuizAttempt, {
  as: 'attempt',
  foreignKey: 'attemptId'
});

// ---------- Assignments ----------
Assignment.belongsTo(Course, {
  as: 'course',
  foreignKey: 'courseId'
});
Course.hasMany(Assignment, {
  as: 'assignments',
  foreignKey: 'courseId'
});

Assignment.hasMany(AssignmentSubmission, {
  as: 'submissions',
  foreignKey: 'assignmentId'
});
AssignmentSubmission.belongsTo(Assignment, {
  as: 'assignment',
  foreignKey: 'assignmentId'
});

AssignmentSubmission.hasOne(AssignmentGrade, {
  as: 'grade',
  foreignKey: 'submissionId'
});
AssignmentGrade.belongsTo(AssignmentSubmission, {
  as: 'submission',
  foreignKey: 'submissionId'
});

User.hasMany(AssignmentSubmission, {
  as: 'assignmentSubmissions',
  foreignKey: 'studentId'
});
AssignmentSubmission.belongsTo(User, {
  as: 'student',
  foreignKey: 'studentId'
});

User.hasMany(AssignmentGrade, {
  as: 'assignmentGrades',
  foreignKey: 'gradedBy'
});
AssignmentGrade.belongsTo(User, {
  as: 'grader',
  foreignKey: 'gradedBy'
});

// ---------- Enrollment ----------
User.hasMany(Enrollment, {
  as: 'enrollments',
  foreignKey: 'userId'
});
Enrollment.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});

Course.hasMany(Enrollment, {
  as: 'enrollments',
  foreignKey: 'courseId'
});
Enrollment.belongsTo(Course, {
  as: 'course',
  foreignKey: 'courseId'
});

// ======================================================
// 💳 PAYMENT ASSOCIATIONS (NEW)
// ======================================================

// User ↔ Payments
User.hasMany(Payment, {
  as: 'payments',
  foreignKey: 'userId'
});
Payment.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});

// Course ↔ Payments
Course.hasMany(Payment, {
  as: 'payments',
  foreignKey: 'courseId'
});
Payment.belongsTo(Course, {
  as: 'course',
  foreignKey: 'courseId'
});

// Payment ↔ Transactions
Payment.hasMany(Transaction, {
  as: 'transactions',
  foreignKey: 'paymentId'
});
Transaction.belongsTo(Payment, {
  as: 'payment',
  foreignKey: 'paymentId'
});

// Payment ↔ Invoice (1:1)
Payment.hasOne(Invoice, {
  as: 'invoice',
  foreignKey: 'paymentId'
});
Invoice.belongsTo(Payment, {
  as: 'payment',
  foreignKey: 'paymentId'
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
