const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
const controller = require('../controllers/quizQuestion.controller');

// Add question to quiz
router.post(
  '/question',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.addQuestion
);

router.patch(
  '/question/:questionId',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.updateQuestion
);

router.delete(
  '/question/:questionId',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.deleteQuestion
);

// Add MCQ options
router.post(
  '/options',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.addOptions
);

router.patch(
  '/quiz/:quizId/reorder',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.reorderQuestions
);

router.get(
  '/quiz/:quizId',
  authenticate,
  authorizeRoles('student', 'teacher', 'admin'),
  ensureEnrolled,
  controller.getQuestionsByQuiz
);

module.exports = router;
