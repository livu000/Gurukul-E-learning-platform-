const { Op } = require('sequelize');
const { Enrollment, Lesson, Module, Quiz, QuizAttempt, Assignment } = require('../models');

exports.ensureEnrolled = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher' || req.user.role === 'admin') return next();
    let courseId = req.params.courseId ? Number(req.params.courseId) : Number(req.body.courseId || 0);
    if (!courseId && req.params.lessonId) {
      const lesson = await Lesson.findByPk(req.params.lessonId, { include: { model: Module, as: 'module', attributes: ['courseId'] } });
      if (!lesson?.module) return res.status(404).json({ message: 'Lesson not found' });
      courseId = lesson.module.courseId;
    }
    if (!courseId && (req.body.quizId || req.params.quizId)) {
      const quiz = await Quiz.findByPk(req.body.quizId || req.params.quizId);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      courseId = quiz.courseId;
    }
    if (!courseId && (req.body.assignmentId || req.params.assignmentId)) {
      const assignment = await Assignment.findByPk(req.body.assignmentId || req.params.assignmentId);
      if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
      courseId = assignment.courseId;
    }
    if (!courseId && (req.body.attemptId || req.params.attemptId)) {
      const attempt = await QuizAttempt.findByPk(req.body.attemptId || req.params.attemptId, { include: { model: Quiz, as: 'quiz', attributes: ['courseId'] } });
      if (!attempt?.quiz) return res.status(404).json({ message: 'Quiz attempt not found' });
      courseId = attempt.quiz.courseId;
    }
    if (!courseId) return res.status(400).json({ message: 'Unable to determine course for enrollment check' });
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        courseId,
        status: { [Op.in]: ['active', 'completed'] }
      }
    });
    if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
    return next();
  } catch (error) {
    console.error('Enrollment middleware error:', error);
    return res.status(500).json({ message: 'Enrollment verification failed' });
  }
};
