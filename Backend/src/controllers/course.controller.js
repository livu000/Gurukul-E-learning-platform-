const { Course } = require('../models');

exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Course title is required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const course = await Course.create({
      title,
      description,
      teacherId: req.user.id
    });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};
