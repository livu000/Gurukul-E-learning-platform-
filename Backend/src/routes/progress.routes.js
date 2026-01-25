const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/lesson.controller');

router.get(
  '/course/:courseId',
  authenticate,
  authorizeRoles('student'),
  controller.getCourseProgress
);

module.exports = router;
