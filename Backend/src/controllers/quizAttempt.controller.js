const { Quiz, QuizAttempt, QuizAnswer, QuizQuestion, Course } = require('../models');

exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (!quiz.isPublished) return res.status(403).json({ message: 'Quiz is not published yet' });
    const existingAttempts = await QuizAttempt.count({ where: { quizId, studentId: req.user.id } });
    if (existingAttempts >= Number(quiz.maxAttempts || 1)) return res.status(409).json({ message: 'Maximum attempts reached' });
    const attempt = await QuizAttempt.create({ quizId, studentId: req.user.id, attemptNumber: existingAttempts + 1, status: 'in_progress', totalMarks: quiz.totalMarks || 0, startedAt: new Date() });
    return res.status(201).json(attempt);
  } catch (error) {
    console.error('Start quiz error:', error);
    return res.status(500).json({ message: 'Failed to start quiz' });
  }
};

exports.getAttemptResult = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findByPk(req.params.attemptId, { include: [{ model: Quiz, as: 'quiz', include: [{ model: Course, as: 'course', attributes: ['teacherId'] }] }, { model: QuizAnswer, as: 'answers' }] });
    if (!attempt?.quiz?.course) return res.status(404).json({ message: 'Quiz attempt not found' });
    const isStudentOwner = Number(attempt.studentId) === Number(req.user.id);
    const isTeacherOwner = req.user.role === 'teacher' && Number(attempt.quiz.course.teacherId) === Number(req.user.id);
    if (!isStudentOwner && !isTeacherOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'You are not allowed to view this result' });
    const totalQuestions = await QuizQuestion.count({ where: { quizId: attempt.quizId } });
    const correctAnswers = await QuizAnswer.count({ where: { attemptId: attempt.id, isCorrect: true } });
    return res.json({ id: attempt.id, quizId: attempt.quizId, score: Number(attempt.score || 0), totalMarks: Number(attempt.totalMarks || 0), isPassed: attempt.isPassed, totalQuestions, correctAnswers, startedAt: attempt.startedAt, submittedAt: attempt.submittedAt, status: attempt.status });
  } catch (error) {
    console.error('Get quiz result error:', error);
    return res.status(500).json({ message: 'Failed to load quiz result' });
  }
};
