const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
const controller = require('../controllers/lesson.controller');

router.get(
  '/course/:courseId',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.getCourseProgress
);

module.exports = router;
