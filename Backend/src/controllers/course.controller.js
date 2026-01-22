const { Course } = require('../models');

/**
 * GET /api/courses
 * Public API
 * Anyone (logged in or not) can view courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

/**
 * POST /api/courses
 * Protected API
 * Only authenticated users can create courses
 */
exports.createCourse = async (req, res) => {
  try {
    // 🔐 Route Protection Check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description } = req.body;

    // 🧪 Validation
    if (!title) {
      return res.status(400).json({ message: 'Course title is required' });
    }

    // 📦 Create course
    const course = await Course.create({
      title,
      description,
      teacherId: req.user.id
    });

    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create course' });
  }
};
