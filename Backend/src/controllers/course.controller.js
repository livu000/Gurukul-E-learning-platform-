const { Course } = require('../models');

/**
 * GET /api/courses
 * Role-based listing
 */
exports.getAllCourses = async (req, res) => {
  try {
    const user = req.user;
    let where = {};

    if (user) {
      if (user.role === 'teacher') {
        where.teacherId = user.id;
      } else if (user.role === 'student') {
        where.status = 'published';
      }
      // admin → no filter
    } else {
      // public users
      where.status = 'published';
    }

    const courses = await Course.findAll({ where });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
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
