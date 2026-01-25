const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const quizController = require('../controllers/quiz.controller');

// Teacher creates quiz
router.post(
  '/',
  authenticate,
  authorizeRoles('teacher'),
  quizController.createQuiz
);

module.exports = router;
