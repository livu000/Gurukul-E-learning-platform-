const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/quizAttempt.controller');

// Student starts quiz
router.post(
  '/start',
  authenticate,
  authorizeRoles('student'),
  controller.startQuiz
);

module.exports = router;
