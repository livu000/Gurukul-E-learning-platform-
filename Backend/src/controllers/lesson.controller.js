const { Lesson, Module, Course, LessonProgress, Enrollment } = require('../models');
exports.createLesson = async (req, res) => {
  try {
    const { moduleId, title, content, videoUrl } = req.body;

    if (!moduleId || !title) {
      return res.status(400).json({ message: 'moduleId and title required' });
    }

    const module = await Module.findByPk(moduleId, {
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

    const lesson = await Lesson.create({
      title,
      content,
      videoUrl,
      moduleId
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create lesson' });
  }
};

exports.getLessonsByModule = async (req, res) => {
  const lessons = await Lesson.findAll({
    where: { moduleId: req.params.moduleId },
    order: [['sortOrder', 'ASC']]
  });
  res.json(lessons);
};


exports.getLessonWithProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lessonId;

    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const progress = await LessonProgress.findOne({
      where: {
        userId,
        lessonId
      }
    });

    res.json({
      lesson,
      progress: progress || { status: 'not_started' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load lesson' });
  }
};

exports.completeLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{
        model: Module,
        as: 'module',
        attributes: ['courseId']
      }]
    });

    if (!lesson || !lesson.module) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const courseId = lesson.module.courseId;

    const [progress, created] = await LessonProgress.findOrCreate({
      where: {
        userId,
        lessonId
      },
      defaults: {
        courseId,
        status: 'completed',
        completedAt: new Date()
      }
    });

    if (!created && progress.status !== 'completed') {
      progress.courseId = courseId;
      progress.status = 'completed';
      progress.completedAt = new Date();
      await progress.save();
    }

    res.json({ message: 'Lesson marked as completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to complete lesson' });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId,
        status: 'active'
      }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const totalLessons = await Lesson.count({
      include: [{
        model: Module,
        as: 'module',
        where: { courseId }
      }]
    });

    const completedLessons = await LessonProgress.count({
      where: {
        userId,
        courseId,
        status: 'completed'
      }
    });

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    res.json({
      totalLessons,
      completedLessons,
      percentage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{
        model: Module,
        as: 'module',
        include: [{
          model: Course,
          as: 'course'
        }]
      }]
    });

    if (!lesson || !lesson.module || !lesson.module.course) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (req.user.role === 'teacher' && lesson.module.course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not your course' });
    }

    await lesson.update({
      title: req.body.title || lesson.title,
      content: req.body.content ?? lesson.content,
      videoUrl: req.body.videoUrl ?? lesson.videoUrl
    });

    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update lesson' });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{
        model: Module,
        as: 'module',
        include: [{
          model: Course,
          as: 'course'
        }]
      }]
    });

    if (!lesson || !lesson.module || !lesson.module.course) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (req.user.role === 'teacher' && lesson.module.course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not your course' });
    }

    await LessonProgress.destroy({ where: { lessonId: lesson.id } });
    await lesson.destroy();

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete lesson' });
  }
};
