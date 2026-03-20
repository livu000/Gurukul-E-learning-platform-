const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth.optional');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
const controller = require('../controllers/lesson.controller');

router.post(
  '/',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.createLesson
);

router.get(
  '/module/:moduleId',
  optionalAuth,
  controller.getLessonsByModule
);

router.get(
  '/:lessonId',
  authenticate,
  ensureEnrolled,
  controller.getLessonWithProgress
);

router.post(
  '/:lessonId/progress',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.updateLessonProgress
);

router.post(
  '/:lessonId/complete',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.completeLesson
);

router.patch(
  '/module/:moduleId/reorder',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.reorderLessons
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
