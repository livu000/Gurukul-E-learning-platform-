const { Quiz, Course, Enrollment } = require('../models');

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    if (!courseId || !title?.trim()) return res.status(400).json({ message: 'courseId and title are required' });
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'You are not allowed to add quiz to this course' });
    const quiz = await Quiz.create({
      courseId,
      createdBy: req.user.id,
      title: title.trim(),
      description: req.body.description || null,
      timeLimitMinutes: Number(req.body.timeLimitMinutes ?? req.body.timeLimit ?? 0),
      totalMarks: Number(req.body.totalMarks || 0),
      passingMarks: Number(req.body.passingMarks || 0),
      maxAttempts: Number(req.body.maxAttempts || 1),
      allowRetake: Boolean(req.body.allowRetake),
      shuffleQuestions: Boolean(req.body.shuffleQuestions),
      showResultsImmediately: req.body.showResultsImmediately === undefined ? true : Boolean(req.body.showResultsImmediately),
      isPublished: Boolean(req.body.isPublished),
      availableFrom: req.body.availableFrom || null,
      availableTo: req.body.availableTo || null
    });
    return res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    return res.status(500).json({ message: 'Failed to create quiz' });
  }
};

exports.getQuizzesByCourse = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const where = { courseId };
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId, status: ['active', 'completed'] } });
      if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
      where.isPublished = true;
    }
    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    const quizzes = await Quiz.findAll({ where, order: [['updatedAt', 'DESC']] });
    return res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes by course error:', error);
    return res.status(500).json({ message: 'Failed to load quizzes' });
  }
};

exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: req.user.role === 'teacher' ? { createdBy: req.user.id } : {},
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'teacherId'] }],
      order: [['updatedAt', 'DESC']]
    });
    return res.json(quizzes);
  } catch (error) {
    console.error('Get teacher quizzes error:', error);
    return res.status(500).json({ message: 'Failed to load quizzes' });
  }
};

exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, { include: [{ model: Course, as: 'course' }] });
    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role === 'teacher' && Number(quiz.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    await quiz.update({ isPublished: req.body.isPublished === undefined ? true : Boolean(req.body.isPublished) });
    return res.json(quiz);
  } catch (error) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({ message: 'Failed to update quiz publish status' });
  }
};
