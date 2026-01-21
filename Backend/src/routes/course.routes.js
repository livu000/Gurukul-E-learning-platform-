const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public: list all courses
router.get('/', courseController.getAllCourses);

// Protected: create course (teacher/admin later)
router.post('/', authenticate, courseController.createCourse);

module.exports = router;
