const { Course, Lesson, Module } = require('../models');
const { logAudit } = require('../utils/audit.util');
const { canManageCourse, getNextSortOrder, syncModuleStats } = require('../utils/lms.util');

exports.createModule = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    if (!courseId || !title?.trim()) {
      return res.status(400).json({ message: 'courseId and title are required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const module = await Module.create({
      courseId,
      title: title.trim(),
      description: req.body.description || null,
      sortOrder: Number(req.body.sortOrder || await getNextSortOrder(Module, { courseId })),
      isPublished: req.body.isPublished === undefined ? false : Boolean(req.body.isPublished)
    });

    await syncModuleStats(module.id);
    await logAudit({
      req,
      action: 'CREATE_MODULE',
      entityType: 'modules',
      entityId: module.id,
      newData: module.toJSON()
    });

    return res.status(201).json(module);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create module' });
  }
};

exports.getModulesByCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const canManage = canManageCourse(req.user, course);
    if (!canManage && course.status !== 'published') {
      return res.status(404).json({ message: 'Course not found' });
    }

    const modules = await Module.findAll({
      where: {
        courseId: req.params.courseId,
        ...(canManage ? {} : { isPublished: true })
      },
      include: [{
        model: Lesson,
        as: 'lessons',
        where: canManage ? undefined : { isPublished: true },
        required: false
      }],
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    return res.json(modules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load modules' });
  }
};

exports.reorderModules = async (req, res) => {
  try {
    const { modules } = req.body;
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (!Array.isArray(modules) || !modules.length) {
      return res.status(400).json({ message: 'modules array is required' });
    }

    await Promise.all(
      modules.map((item, index) => Module.update(
        { sortOrder: Number(item.sortOrder || index + 1) },
        { where: { id: item.id, courseId: course.id } }
      ))
    );

    const updated = await Module.findAll({
      where: { courseId: course.id },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to reorder modules' });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!module?.course) return res.status(404).json({ message: 'Module not found' });
    if (!canManageCourse(req.user, module.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = module.toJSON();
    await module.update({
      title: req.body.title?.trim() || module.title,
      description: req.body.description ?? module.description,
      sortOrder: req.body.sortOrder ?? module.sortOrder,
      isPublished: req.body.isPublished ?? module.isPublished
    });

    await syncModuleStats(module.id);
    await logAudit({
      req,
      action: 'UPDATE_MODULE',
      entityType: 'modules',
      entityId: module.id,
      oldData,
      newData: module.toJSON()
    });

    return res.json(module);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update module' });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!module?.course) return res.status(404).json({ message: 'Module not found' });
    if (!canManageCourse(req.user, module.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = module.toJSON();
    await module.destroy();

    await logAudit({
      req,
      action: 'DELETE_MODULE',
      entityType: 'modules',
      entityId: module.id,
      oldData
    });

    return res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete module' });
  }
};
