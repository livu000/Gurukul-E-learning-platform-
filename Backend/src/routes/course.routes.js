const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { optionalAuth } = require('../middleware/auth.optional');
// GET courses
// Anyone can access (auth optional, filtering handled in controller)
router.get('/', optionalAuth, courseController.getAllCourses);

// CREATE course
// Only admin & teacher
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'teacher'),
  courseController.createCourse
);

// Teacher submits course for review
router.patch(
  '/:id/submit',
  authenticate,
  authorizeRoles('teacher'),
  courseController.submitForReview
);

// Admin approves/rejects
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('admin'),
  courseController.updateCourseStatus
);

module.exports = router;
