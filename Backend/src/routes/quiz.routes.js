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

router.get(
  '/:id',
  authenticate,
  authorizeRoles('student', 'teacher', 'admin'),
  quizController.getQuizById
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  quizController.updateQuiz
);

router.patch(
  '/:id/publish',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  quizController.publishQuiz
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  quizController.deleteQuiz
);

module.exports = router;
