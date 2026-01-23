const { Module, Course } = require('../models');

exports.createModule = async (req, res) => {
  const { courseId, title } = req.body;

  if (!courseId || !title) {
    return res.status(400).json({ message: 'courseId and title required' });
  }

  const course = await Course.findByPk(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (req.user.role === 'teacher' && course.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not your course' });
  }

  const module = await Module.create({ title, courseId });
  res.status(201).json(module);
};

exports.getModulesByCourse = async (req, res) => {
  const modules = await Module.findAll({
    where: { courseId: req.params.courseId },
    order: [['sortOrder', 'ASC']]
  });
  res.json(modules);
};
