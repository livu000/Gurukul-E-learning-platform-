const { Module, Course, Lesson } = require('../models');

async function syncModuleStats(moduleId) {
  const lessons = await Lesson.findAll({ where: { moduleId }, attributes: ['durationMinutes'] });
  const totalDurationMinutes = lessons.reduce((sum, lesson) => sum + Number(lesson.durationMinutes || 0), 0);
  await Module.update({ lessonCount: lessons.length, totalDurationMinutes }, { where: { id: moduleId } });
}

exports.createModule = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    if (!courseId || !title?.trim()) return res.status(400).json({ message: 'courseId and title required' });
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    const module = await Module.create({
      courseId,
      title: title.trim(),
      description: req.body.description || null,
      sortOrder: Number(req.body.sortOrder || 1),
      isPublished: req.body.isPublished === undefined ? true : Boolean(req.body.isPublished)
    });
    await syncModuleStats(module.id);
    return res.status(201).json(module);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create module' });
  }
};

exports.getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.findAll({ where: { courseId: req.params.courseId }, order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    return res.json(modules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load modules' });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, { include: [{ model: Course, as: 'course' }] });
    if (!module?.course) return res.status(404).json({ message: 'Module not found' });
    if (req.user.role === 'teacher' && Number(module.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    await module.update({
      title: req.body.title ?? module.title,
      description: req.body.description ?? module.description,
      sortOrder: req.body.sortOrder ?? module.sortOrder,
      isPublished: req.body.isPublished ?? module.isPublished
    });
    await syncModuleStats(module.id);
    return res.json(module);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update module' });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, { include: [{ model: Course, as: 'course' }] });
    if (!module?.course) return res.status(404).json({ message: 'Module not found' });
    if (req.user.role === 'teacher' && Number(module.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    await module.destroy();
    return res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete module' });
  }
};
