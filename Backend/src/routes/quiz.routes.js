const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const quizController = require('../controllers/quiz.controller');

// Teacher creates quiz
router.post(
  '/',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  quizController.createQuiz
);

router.get(
  '/course/:courseId',
  authenticate,
  authorizeRoles('student', 'teacher', 'admin'),
  quizController.getQuizzesByCourse
);

router.get(
  '/teacher',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  quizController.getTeacherQuizzes
);

router.patch(
  '/:id/publish',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  quizController.publishQuiz
);

module.exports = router;
