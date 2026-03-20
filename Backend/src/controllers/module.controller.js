const { Module, Course, Lesson } = require('../models');

exports.createModule = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create module' });
  }
};

exports.getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.findAll({
      where: { courseId: req.params.courseId },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });
    res.json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load modules' });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{
        model: Course,
        as: 'course'
      }]
    });

    if (!module || !module.course) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (req.user.role === 'teacher' && module.course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not your course' });
    }

    await module.update({
      title: req.body.title || module.title
    });

    res.json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update module' });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{
        model: Course,
        as: 'course'
      }]
    });

    if (!module || !module.course) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (req.user.role === 'teacher' && module.course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not your course' });
    }

    await Lesson.destroy({ where: { moduleId: module.id } });
    await module.destroy();

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete module' });
  }
};
