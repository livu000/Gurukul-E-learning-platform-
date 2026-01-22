const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// PUBLIC
router.get('/', courseController.getAllCourses);

// PROTECTED + ROLE-BASED
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'teacher'),
  courseController.createCourse
);

module.exports = router;
