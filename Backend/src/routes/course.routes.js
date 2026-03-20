const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { optionalAuth } = require('../middleware/auth.optional');
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/mine', authenticate, authorizeRoles('teacher', 'admin'), courseController.getTeacherCourses);
router.get('/review-queue', authenticate, authorizeRoles('admin'), courseController.getReviewQueue);
router.get('/:id', optionalAuth, courseController.getCourseById);
router.post('/', authenticate, authorizeRoles('admin', 'teacher'), courseController.createCourse);
router.patch('/:id', authenticate, authorizeRoles('admin', 'teacher'), courseController.updateCourse);
router.patch('/:id/submit', authenticate, authorizeRoles('teacher', 'admin'), courseController.submitForReview);
router.patch('/:id/status', authenticate, authorizeRoles('admin'), courseController.updateCourseStatus);
router.delete('/:id', authenticate, authorizeRoles('admin', 'teacher'), courseController.deleteCourse);

module.exports = router;
