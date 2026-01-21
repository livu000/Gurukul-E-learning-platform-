const express = require('express');
const router = express.Router();
const course = require('../controllers/course.controller');
// a simple middleware to decode JWT (implement properly in auth.middleware)
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', course.list);
router.post('/', authenticate, course.createCourse);

module.exports = router;
