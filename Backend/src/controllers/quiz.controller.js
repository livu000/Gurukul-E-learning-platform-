const { Op } = require('sequelize');
const { Quiz, Course, Enrollment, QuizQuestion } = require('../models');
const { logAudit } = require('../utils/audit.util');
const { canManageCourse, syncQuizTotalMarks } = require('../utils/lms.util');

function isQuizAvailable(quiz) {
  const now = new Date();
  if (quiz.availableFrom && now < new Date(quiz.availableFrom)) return false;
  if (quiz.availableTo && now > new Date(quiz.availableTo)) return false;
  return true;
}

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    if (!courseId || !title?.trim()) {
      return res.status(400).json({ message: 'courseId and title are required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You are not allowed to add quizzes to this course' });
    }

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
      showResultsImmediately: req.body.showResultsImmediately === undefined
        ? true
        : Boolean(req.body.showResultsImmediately),
      isPublished: req.body.isPublished === undefined ? false : Boolean(req.body.isPublished),
      availableFrom: req.body.availableFrom || null,
      availableTo: req.body.availableTo || null
    });

    await logAudit({
      req,
      action: 'CREATE_QUIZ',
      entityType: 'quizzes',
      entityId: quiz.id,
      newData: quiz.toJSON()
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
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId,
          status: { [Op.in]: ['active', 'completed'] }
        }
      });
      if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
      where.isPublished = true;
    }

    if ((req.user.role === 'teacher' || req.user.role === 'admin') && !canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const quizzes = await Quiz.findAll({
      where,
      order: [['updated_at', 'DESC'], ['id', 'DESC']]
    });

    return res.json(
      quizzes.filter((quiz) => req.user.role !== 'student' || isQuizAvailable(quiz))
    );
  } catch (error) {
    console.error('Get quizzes by course error:', error);
    return res.status(500).json({ message: 'Failed to load quizzes' });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'teacherId', 'status'] },
        { model: QuizQuestion, as: 'questions', required: false }
      ]
    });

    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    const canManage = canManageCourse(req.user, quiz.course);

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId: quiz.courseId,
          status: { [Op.in]: ['active', 'completed'] }
        }
      });

      if (!enrollment) {
        return res.status(403).json({ message: 'You are not enrolled in this course' });
      }

      if (!quiz.isPublished || !isQuizAvailable(quiz)) {
        return res.status(403).json({ message: 'Quiz is not available' });
      }
    } else if (!canManage && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your quiz' });
    }

    return res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    return res.status(500).json({ message: 'Failed to load quiz' });
  }
};

exports.getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: req.user.role === 'teacher' ? { createdBy: req.user.id } : {},
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'teacherId'] }],
      order: [['updated_at', 'DESC']]
    });
    return res.json(quizzes);
  } catch (error) {
    console.error('Get teacher quizzes error:', error);
    return res.status(500).json({ message: 'Failed to load quizzes' });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });
    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    if (!canManageCourse(req.user, quiz.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = quiz.toJSON();
    await quiz.update({
      title: req.body.title?.trim() || quiz.title,
      description: req.body.description ?? quiz.description,
      timeLimitMinutes: req.body.timeLimitMinutes ?? req.body.timeLimit ?? quiz.timeLimitMinutes,
      passingMarks: req.body.passingMarks ?? quiz.passingMarks,
      maxAttempts: req.body.maxAttempts ?? quiz.maxAttempts,
      allowRetake: req.body.allowRetake ?? quiz.allowRetake,
      shuffleQuestions: req.body.shuffleQuestions ?? quiz.shuffleQuestions,
      showResultsImmediately: req.body.showResultsImmediately ?? quiz.showResultsImmediately,
      isPublished: req.body.isPublished ?? quiz.isPublished,
      availableFrom: req.body.availableFrom ?? quiz.availableFrom,
      availableTo: req.body.availableTo ?? quiz.availableTo
    });

    await syncQuizTotalMarks(quiz.id);
    await quiz.reload();

    await logAudit({
      req,
      action: 'UPDATE_QUIZ',
      entityType: 'quizzes',
      entityId: quiz.id,
      oldData,
      newData: quiz.toJSON()
    });

    return res.json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    return res.status(500).json({ message: 'Failed to update quiz' });
  }
};

exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });
    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    if (!canManageCourse(req.user, quiz.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = quiz.toJSON();
    await quiz.update({
      isPublished: req.body.isPublished === undefined ? true : Boolean(req.body.isPublished)
    });

    await logAudit({
      req,
      action: 'PUBLISH_QUIZ',
      entityType: 'quizzes',
      entityId: quiz.id,
      oldData,
      newData: quiz.toJSON()
    });

    return res.json(quiz);
  } catch (error) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({ message: 'Failed to update quiz publish status' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });
    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    if (!canManageCourse(req.user, quiz.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = quiz.toJSON();
    await quiz.destroy();

    await logAudit({
      req,
      action: 'DELETE_QUIZ',
      entityType: 'quizzes',
      entityId: quiz.id,
      oldData
    });

    return res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return res.status(500).json({ message: 'Failed to delete quiz' });
  }
};
