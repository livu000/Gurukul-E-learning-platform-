const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
const controller = require('../controllers/quizAttempt.controller');

// Student starts quiz (Enrollment enforced)
router.post(
  '/start',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.startQuiz
);

router.get(
  '/:attemptId',
  authenticate,
  authorizeRoles('student', 'teacher', 'admin'),
  controller.getAttemptResult
);

module.exports = router;
