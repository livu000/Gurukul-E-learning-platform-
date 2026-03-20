const { Op } = require('sequelize');
const { Course, Module, Lesson, LessonProgress, Enrollment } = require('../models');

async function syncModuleStats(moduleId) {
  const lessons = await Lesson.findAll({ where: { moduleId }, attributes: ['durationMinutes'] });
  const totalDurationMinutes = lessons.reduce((sum, lesson) => sum + Number(lesson.durationMinutes || 0), 0);
  await Module.update({ lessonCount: lessons.length, totalDurationMinutes }, { where: { id: moduleId } });
}

async function syncEnrollmentProgress(userId, courseId, lastLessonId = null) {
  const totalLessons = await Lesson.count({ include: [{ model: Module, as: 'module', where: { courseId } }] });
  const completedLessons = await LessonProgress.count({ where: { userId, courseId, isCompleted: true } });
  const progressPercentage = totalLessons ? Number(((completedLessons / totalLessons) * 100).toFixed(2)) : 0;
  const enrollment = await Enrollment.findOne({ where: { userId, courseId, status: { [Op.in]: ['active', 'completed'] } } });
  if (!enrollment) return null;

  await enrollment.update({
    progressPercentage,
    lastAccessedLessonId: lastLessonId || enrollment.lastAccessedLessonId,
    status: progressPercentage >= 100 ? 'completed' : enrollment.status === 'completed' ? 'active' : enrollment.status,
    completedAt: progressPercentage >= 100 ? (enrollment.completedAt || new Date()) : null
  });

  return enrollment;
}

function buildProgressPayload(progress) {
  return progress || {
    isCompleted: false,
    lastWatchedSecond: 0,
    totalWatchedSeconds: 0,
    status: 'not_started'
  };
}

async function buildCurriculum(courseId, canManage) {
  const course = await Course.findByPk(courseId, {
    attributes: ['id', 'title'],
    include: [{
      model: Module,
      as: 'modules',
      include: [{ model: Lesson, as: 'lessons' }]
    }]
  });

  if (!course) {
    return { course: null, curriculum: [] };
  }

  const curriculum = (course.modules || [])
    .filter((module) => canManage || module.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((module) => ({
      id: module.id,
      title: module.title,
      sortOrder: module.sortOrder,
      lessons: (module.lessons || [])
        .filter((lesson) => canManage || lesson.isPublished)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          sortOrder: lesson.sortOrder,
          durationMinutes: lesson.durationMinutes,
          lessonType: lesson.lessonType,
          isPreview: lesson.isPreview
        }))
    }))
    .filter((module) => module.lessons.length > 0 || canManage);

  return {
    course: { id: course.id, title: course.title },
    curriculum
  };
}

exports.createLesson = async (req, res) => {
  try {
    const { moduleId, title } = req.body;
    if (!moduleId || !title?.trim()) return res.status(400).json({ message: 'moduleId and title required' });
    const module = await Module.findByPk(moduleId, { include: [{ model: Course, as: 'course' }] });
    if (!module || !module.course) return res.status(404).json({ message: 'Module not found' });
    if (req.user.role === 'teacher' && Number(module.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    const lesson = await Lesson.create({
      moduleId,
      title: title.trim(),
      description: req.body.description || null,
      content: req.body.content || null,
      videoUrl: req.body.videoUrl || null,
      attachmentUrl: req.body.attachmentUrl || null,
      lessonType: req.body.lessonType || (req.body.videoUrl ? 'video' : 'text'),
      durationMinutes: Number(req.body.durationMinutes || 0),
      isPreview: Boolean(req.body.isPreview),
      isPublished: req.body.isPublished === undefined ? true : Boolean(req.body.isPublished),
      videoProvider: req.body.videoProvider || null,
      videoDurationSeconds: Number(req.body.videoDurationSeconds || 0),
      sortOrder: Number(req.body.sortOrder || 1)
    });
    await syncModuleStats(moduleId);
    return res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create lesson' });
  }
};

exports.getLessonsByModule = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({ where: { moduleId: req.params.moduleId }, order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    return res.json(lessons);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load lessons' });
  }
};

exports.getLessonWithProgress = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      include: [{
        model: Module,
        as: 'module',
        include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'teacherId'] }]
      }]
    });

    if (!lesson?.module?.course) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const canManage = req.user.role === 'admin' || (req.user.role === 'teacher' && Number(lesson.module.course.teacherId) === Number(req.user.id));
    const progress = await LessonProgress.findOne({ where: { userId: req.user.id, lessonId: lesson.id } });
    const { course, curriculum } = await buildCurriculum(lesson.module.course.id, canManage);

    return res.json({
      lesson,
      progress: buildProgressPayload(progress),
      course,
      curriculum
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load lesson' });
  }
};

exports.updateLessonProgress = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      include: [{ model: Module, as: 'module', attributes: ['courseId'] }]
    });

    if (!lesson?.module) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const lastWatchedSecond = Math.max(0, Number(req.body.lastWatchedSecond || 0));
    const totalWatchedSeconds = Math.max(lastWatchedSecond, Number(req.body.totalWatchedSeconds || 0));
    const completionTarget = Number(lesson.videoDurationSeconds || 0) || Number(lesson.durationMinutes || 0) * 60;
    const shouldComplete = Boolean(req.body.isCompleted) || (completionTarget > 0 && totalWatchedSeconds >= completionTarget);

    const [progress] = await LessonProgress.findOrCreate({
      where: { userId: req.user.id, lessonId: lesson.id },
      defaults: {
        courseId: lesson.module.courseId,
        lastWatchedSecond,
        totalWatchedSeconds,
        isCompleted: shouldComplete,
        completedAt: shouldComplete ? new Date() : null,
        lastAccessedAt: new Date()
      }
    });

    await progress.update({
      courseId: lesson.module.courseId,
      lastWatchedSecond: Math.max(Number(progress.lastWatchedSecond || 0), lastWatchedSecond),
      totalWatchedSeconds: Math.max(Number(progress.totalWatchedSeconds || 0), totalWatchedSeconds),
      isCompleted: shouldComplete || progress.isCompleted,
      completedAt: shouldComplete ? (progress.completedAt || new Date()) : progress.completedAt,
      lastAccessedAt: new Date()
    });

    await syncEnrollmentProgress(req.user.id, lesson.module.courseId, lesson.id);
    return res.json({ progress });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update lesson progress' });
  }
};

exports.completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, { include: [{ model: Module, as: 'module', attributes: ['courseId'] }] });
    if (!lesson || !lesson.module) return res.status(404).json({ message: 'Lesson not found' });
    const [progress] = await LessonProgress.findOrCreate({
      where: { userId: req.user.id, lessonId: lesson.id },
      defaults: {
        courseId: lesson.module.courseId,
        lastWatchedSecond: lesson.videoDurationSeconds || 0,
        totalWatchedSeconds: lesson.videoDurationSeconds || 0,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date()
      }
    });
    if (!progress.isCompleted) {
      await progress.update({
        courseId: lesson.module.courseId,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
        lastWatchedSecond: Math.max(progress.lastWatchedSecond || 0, lesson.videoDurationSeconds || 0),
        totalWatchedSeconds: Math.max(progress.totalWatchedSeconds || 0, lesson.videoDurationSeconds || 0)
      });
    }
    await syncEnrollmentProgress(req.user.id, lesson.module.courseId, lesson.id);
    return res.json({ message: 'Lesson marked as completed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to complete lesson' });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: req.params.courseId, status: { [Op.in]: ['active', 'completed'] } } });
    if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
    const totalLessons = await Lesson.count({ include: [{ model: Module, as: 'module', where: { courseId: req.params.courseId } }] });
    const completedLessons = await LessonProgress.count({ where: { userId: req.user.id, courseId: req.params.courseId, isCompleted: true } });
    return res.json({ totalLessons, completedLessons, percentage: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0, lastAccessedLessonId: enrollment.lastAccessedLessonId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, { include: [{ model: Module, as: 'module', include: [{ model: Course, as: 'course' }] }] });
    if (!lesson || !lesson.module?.course) return res.status(404).json({ message: 'Lesson not found' });
    if (req.user.role === 'teacher' && Number(lesson.module.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    await lesson.update({
      title: req.body.title ?? lesson.title,
      description: req.body.description ?? lesson.description,
      content: req.body.content ?? lesson.content,
      videoUrl: req.body.videoUrl ?? lesson.videoUrl,
      attachmentUrl: req.body.attachmentUrl ?? lesson.attachmentUrl,
      lessonType: req.body.lessonType ?? lesson.lessonType,
      durationMinutes: req.body.durationMinutes ?? lesson.durationMinutes,
      isPreview: req.body.isPreview ?? lesson.isPreview,
      isPublished: req.body.isPublished ?? lesson.isPublished,
      videoProvider: req.body.videoProvider ?? lesson.videoProvider,
      videoDurationSeconds: req.body.videoDurationSeconds ?? lesson.videoDurationSeconds,
      sortOrder: req.body.sortOrder ?? lesson.sortOrder
    });
    await syncModuleStats(lesson.moduleId);
    return res.json(lesson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update lesson' });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, { include: [{ model: Module, as: 'module', include: [{ model: Course, as: 'course' }] }] });
    if (!lesson || !lesson.module?.course) return res.status(404).json({ message: 'Lesson not found' });
    if (req.user.role === 'teacher' && Number(lesson.module.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    await LessonProgress.destroy({ where: { lessonId: lesson.id } });
    const moduleId = lesson.moduleId;
    await lesson.destroy();
    await syncModuleStats(moduleId);
    return res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete lesson' });
  }
};
