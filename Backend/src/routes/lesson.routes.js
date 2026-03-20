const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
const controller = require('../controllers/lesson.controller');

/**
 * CREATE LESSON
 * Teacher / Admin only
 * (UNCHANGED)
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.createLesson
);

/**
 * GET LESSONS BY MODULE
 * Public (course preview)
 * (UNCHANGED)
 */
router.get(
  '/module/:moduleId',
  controller.getLessonsByModule
);

/**
 * GET LESSON CONTENT + PROGRESS
 * Student must be ENROLLED
 * Teacher/Admin bypass handled inside middleware
 */
router.get(
  '/:lessonId',
  authenticate,
  ensureEnrolled,
  controller.getLessonWithProgress
);

/**
 * MARK LESSON AS COMPLETED
 * Student must be ENROLLED
 */
router.post(
  '/:lessonId/complete',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.completeLesson
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.updateLesson
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.deleteLesson
);

module.exports = router;
