const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { optionalAuth } = require('../middleware/auth.optional');
const { auditAction } = require('../middleware/audit.middleware');


// ======================================
// GET courses
// Anyone can access (no audit needed)
// ======================================
router.get('/', optionalAuth, courseController.getAllCourses);


// ======================================
// CREATE course (AUDITED)
// ======================================
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'teacher'),

  // 🔴 ADD HERE
  auditAction('COURSE_CREATE', 'COURSE'),

  courseController.createCourse
);


// ======================================
// Teacher submits course for review
// ======================================
router.patch(
  '/:id/submit',
  authenticate,
  authorizeRoles('teacher'),

  // 🔴 ADD HERE
  auditAction('COURSE_SUBMIT_REVIEW', 'COURSE'),

  courseController.submitForReview
);


// ======================================
// Admin approves/rejects course
// ======================================
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('admin'),

  // 🔴 ADD HERE
  auditAction('COURSE_STATUS_CHANGE', 'COURSE'),

  courseController.updateCourseStatus
);

module.exports = router;
