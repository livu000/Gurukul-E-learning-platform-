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
  '/my-submissions',
  authenticate,
  authorizeRoles('student'),
  controller.getMySubmissions
);

router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.getSubmissionsByAssignment
);

router.get(
  '/:assignmentId',
  authenticate,
  authorizeRoles('student', 'teacher', 'admin'),
  controller.getAssignmentById
);

router.post(
  '/grade',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.gradeSubmission
);

router.patch(
  '/:assignmentId',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.updateAssignment
);

router.patch(
  '/:assignmentId/publish',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.publishAssignment
);

router.delete(
  '/:assignmentId',
  authenticate,
  authorizeRoles('teacher', 'admin'),
  controller.deleteAssignment
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
  authorizeRoles('student', 'teacher', 'admin'),
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
