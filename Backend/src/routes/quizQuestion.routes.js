const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
const controller = require('../controllers/quizQuestion.controller');

// Add question to quiz
router.post(
  '/question',
  authenticate,
  authorizeRoles('teacher'),
  controller.addQuestion
);

// Add MCQ options
router.post(
  '/options',
  authenticate,
  authorizeRoles('teacher'),
  controller.addOptions
);

router.get(
  '/quiz/:quizId',
  authenticate,
  authorizeRoles('student', 'teacher', 'admin'),
  ensureEnrolled,
  controller.getQuestionsByQuiz
);

module.exports = router;
