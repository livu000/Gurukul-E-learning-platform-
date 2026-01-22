const { Course } = require('../models');

/**
 * GET /api/courses
 * Public – list courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load courses' });
  }
};

/**
 * POST /api/courses
 * Teacher / Admin only
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const course = await Course.create({
      title,
      description,
      teacherId: req.user.id
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Course creation failed' });
  }
};
