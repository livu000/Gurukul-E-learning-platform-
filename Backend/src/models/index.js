const sequelize = require('../config/db');
const User = require('./user.model');
const Course = require('./course.model');
const Module = require('./module.model');
const Lesson = require('./lesson.model');
const LessonProgress = require('./lessonProgress.model');
const Quiz = require('./quiz.model');
const QuizQuestion = require('./quizQuestion.model');
const QuizOption = require('./quizOption.model');
const QuizAttempt = require('./quizAttempt.model');
const QuizAnswer = require('./quizAnswer.model');
const Assignment = require('./assignment.model');
const AssignmentSubmission = require('./assignmentSubmission.model');
const AssignmentGrade = require('./assignmentGrade.model');
const Certificate = require('./certificate.model');
const Enrollment = require('./enrollment.model');
const Payment = require('./payment.model');
const Transaction = require('./transaction.model');
const Invoice = require('./invoice.model');
const AuditLog = require('./auditLog.model');
const RefreshToken = require('./refreshToken.model');

User.hasMany(Course, { as: 'courses', foreignKey: 'teacherId' });
Course.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
User.hasMany(Course, { as: 'approvedCourses', foreignKey: 'approvedBy' });
Course.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

Course.hasMany(Module, { as: 'modules', foreignKey: 'courseId' });
Module.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Module.hasMany(Lesson, { as: 'lessons', foreignKey: 'moduleId' });
Lesson.belongsTo(Module, { as: 'module', foreignKey: 'moduleId' });

User.hasMany(LessonProgress, { as: 'lessonProgress', foreignKey: 'userId' });
LessonProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Course.hasMany(LessonProgress, { as: 'progressRecords', foreignKey: 'courseId' });
LessonProgress.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Lesson.hasMany(LessonProgress, { as: 'progressRecords', foreignKey: 'lessonId' });
LessonProgress.belongsTo(Lesson, { as: 'lesson', foreignKey: 'lessonId' });

Course.hasMany(Quiz, { as: 'quizzes', foreignKey: 'courseId' });
Quiz.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
User.hasMany(Quiz, { as: 'createdQuizzes', foreignKey: 'createdBy' });
Quiz.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Quiz.hasMany(QuizQuestion, { as: 'questions', foreignKey: 'quizId' });
QuizQuestion.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });
QuizQuestion.hasMany(QuizOption, { as: 'options', foreignKey: 'questionId' });
QuizOption.belongsTo(QuizQuestion, { as: 'question', foreignKey: 'questionId' });
Quiz.hasMany(QuizAttempt, { as: 'attempts', foreignKey: 'quizId' });
QuizAttempt.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });
User.hasMany(QuizAttempt, { as: 'quizAttempts', foreignKey: 'studentId' });
QuizAttempt.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
QuizAttempt.hasMany(QuizAnswer, { as: 'answers', foreignKey: 'attemptId' });
QuizAnswer.belongsTo(QuizAttempt, { as: 'attempt', foreignKey: 'attemptId' });
QuizAnswer.belongsTo(QuizQuestion, { as: 'question', foreignKey: 'questionId' });
QuizAnswer.belongsTo(QuizOption, { as: 'selectedOption', foreignKey: 'selectedOptionId' });

Course.hasMany(Assignment, { as: 'assignments', foreignKey: 'courseId' });
Assignment.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
User.hasMany(Assignment, { as: 'createdAssignments', foreignKey: 'createdBy' });
Assignment.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Assignment.hasMany(AssignmentSubmission, { as: 'submissions', foreignKey: 'assignmentId' });
AssignmentSubmission.belongsTo(Assignment, { as: 'assignment', foreignKey: 'assignmentId' });
User.hasMany(AssignmentSubmission, { as: 'assignmentSubmissions', foreignKey: 'studentId' });
AssignmentSubmission.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
AssignmentSubmission.hasOne(AssignmentGrade, { as: 'grade', foreignKey: 'submissionId' });
AssignmentGrade.belongsTo(AssignmentSubmission, { as: 'submission', foreignKey: 'submissionId' });
User.hasMany(AssignmentGrade, { as: 'assignmentGrades', foreignKey: 'gradedBy' });
AssignmentGrade.belongsTo(User, { as: 'grader', foreignKey: 'gradedBy' });

User.hasMany(Payment, { as: 'payments', foreignKey: 'userId' });
Payment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Course.hasMany(Payment, { as: 'payments', foreignKey: 'courseId' });
Payment.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Payment.hasMany(Transaction, { as: 'transactions', foreignKey: 'paymentId' });
Transaction.belongsTo(Payment, { as: 'payment', foreignKey: 'paymentId' });
Payment.hasOne(Invoice, { as: 'invoice', foreignKey: 'paymentId' });
Invoice.belongsTo(Payment, { as: 'payment', foreignKey: 'paymentId' });
Invoice.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Invoice.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

User.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'userId' });
Enrollment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Course.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Payment.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'paymentId' });
Enrollment.belongsTo(Payment, { as: 'payment', foreignKey: 'paymentId' });
Lesson.hasMany(Enrollment, { as: 'lastAccessedEnrollments', foreignKey: 'lastAccessedLessonId' });
Enrollment.belongsTo(Lesson, { as: 'lastAccessedLesson', foreignKey: 'lastAccessedLessonId' });

User.hasMany(Certificate, { as: 'certificates', foreignKey: 'userId' });
Certificate.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Course.hasMany(Certificate, { as: 'certificates', foreignKey: 'courseId' });
Certificate.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Enrollment.hasMany(Certificate, { as: 'certificates', foreignKey: 'enrollmentId' });
Certificate.belongsTo(Enrollment, { as: 'enrollment', foreignKey: 'enrollmentId' });

User.hasMany(RefreshToken, { as: 'refreshTokens', foreignKey: 'userId' });
RefreshToken.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(AuditLog, { as: 'auditLogs', foreignKey: 'userId' });
AuditLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

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
  AssignmentGrade,
  Certificate,
  Enrollment,
  Payment,
  Transaction,
  Invoice,
  AuditLog,
  RefreshToken
};
