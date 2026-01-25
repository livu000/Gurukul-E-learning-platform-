const { Lesson, Module, LessonProgress } = require('../models');
exports.createLesson = async (req, res) => {
  const { moduleId, title, content, videoUrl } = req.body;

  if (!moduleId || !title) {
    return res.status(400).json({ message: 'moduleId and title required' });
  }

  const module = await Module.findByPk(moduleId);
  if (!module) {
    return res.status(404).json({ message: 'Module not found' });
  }

  const lesson = await Lesson.create({
    title,
    content,
    videoUrl,
    moduleId
  });

  res.status(201).json(lesson);
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
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId required' });
    }

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

    const totalLessons = await Lesson.count({
      include: [{
        model: Module,
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
