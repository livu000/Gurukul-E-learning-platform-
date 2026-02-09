const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/quizSubmission.controller');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');
// Student submits quiz
router.post(
  '/submit',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.submitQuiz
);

module.exports = router;
