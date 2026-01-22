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

/**
 * Teacher → submit course for review
 * PATCH /api/courses/:id/submit
 */
exports.submitForReview = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (course.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft courses can be submitted' });
    }

    course.status = 'review';
    await course.save();

    res.json({ message: 'Course submitted for review' });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed' });
  }
};

/**
 * Admin → approve or reject course
 * PATCH /api/courses/:id/status
 */
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['published', 'draft'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'review') {
      return res.status(400).json({ message: 'Course is not under review' });
    }

    course.status = status;
    await course.save();

    res.json({ message: `Course ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Status update failed' });
  }
};
