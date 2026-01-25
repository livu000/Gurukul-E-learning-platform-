const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/lesson.controller');

router.post(
  '/',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.createLesson
);

router.get(
  '/module/:moduleId',
  controller.getLessonsByModule
);

// ===== Feature 2.5 =====

// Get lesson content + progress
router.get(
  '/:lessonId',
  authenticate,
  controller.getLessonWithProgress
);

// Mark lesson as completed
router.post(
  '/:lessonId/complete',
  authenticate,
  authorizeRoles('student'),
  controller.completeLesson
);

module.exports = router;
