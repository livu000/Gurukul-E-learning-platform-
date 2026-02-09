const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const enrollmentController = require('../controllers/enrollment.controller');

/**
 * ENROLL IN A COURSE
 * POST /api/enrollments/:courseId
 * Student only
 */
router.post(
  '/:courseId',
  authenticate,
  (req, res, next) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can enroll in courses'
      });
    }
    next();
  },
  enrollmentController.enrollInCourse
);

/**
 * GET MY ENROLLMENTS
 * GET /api/enrollments/my
 * Student only
 */
router.get(
  '/my',
  authenticate,
  (req, res, next) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can view enrollments'
      });
    }
    next();
  },
  enrollmentController.getMyEnrollments
);

module.exports = router;
