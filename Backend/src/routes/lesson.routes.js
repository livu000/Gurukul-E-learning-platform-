const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
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
