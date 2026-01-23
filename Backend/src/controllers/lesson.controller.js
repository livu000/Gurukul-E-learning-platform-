const { Lesson, Module } = require('../models');

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
