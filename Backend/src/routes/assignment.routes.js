const router = require('express').Router();
const controller = require('../controllers/assignment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { ensureEnrolled } = require('../middleware/enrollment.middleware');

// Teacher

router.post(
  '/',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.createAssignment
);

router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.getSubmissionsByAssignment
);

router.post(
  '/grade',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.gradeSubmission
);

router.put(
  '/submissions/:submissionId/grade',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.gradeSubmission
);


// Student

router.get(
  '/course/:courseId',
  authenticate,
  authorizeRoles('student', 'teacher'),
  controller.getAssignmentsByCourse
);

router.post(
  '/submit',
  authenticate,
  authorizeRoles('student'),
  ensureEnrolled,
  controller.submitAssignment
);

module.exports = router;
