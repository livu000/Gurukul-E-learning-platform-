const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/quizSubmission.controller');

// Student submits quiz
router.post(
  '/submit',
  authenticate,
  authorizeRoles('student'),
  controller.submitQuiz
);

module.exports = router;
