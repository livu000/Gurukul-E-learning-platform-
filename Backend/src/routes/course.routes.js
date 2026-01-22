const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Public
router.get('/', courseController.getAllCourses);

// Protected + RBAC
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'teacher'),
  courseController.createCourse
);

module.exports = router;
