const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { optionalAuth } = require('../middleware/auth.optional');
const { auditAction } = require('../middleware/audit.middleware');

const { Course } = require('../models');


// GET courses (no audit)
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/:id', optionalAuth, courseController.getCourseById);


// CREATE course (no OLD data needed)
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'teacher'),
  auditAction('COURSE_CREATE', 'COURSE'),
  courseController.createCourse
);


// SUBMIT FOR REVIEW (OLD vs NEW)
router.patch(
  '/:id/submit',
  authenticate,
  authorizeRoles('teacher'),
  auditAction('COURSE_SUBMIT_REVIEW', 'COURSE', Course),
  courseController.submitForReview
);


// STATUS CHANGE (OLD vs NEW)
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('admin'),
  auditAction('COURSE_STATUS_CHANGE', 'COURSE', Course),
  courseController.updateCourseStatus
);

module.exports = router;
