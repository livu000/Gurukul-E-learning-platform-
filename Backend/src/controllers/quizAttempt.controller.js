const { Quiz, QuizAttempt, QuizAnswer, QuizQuestion, Course } = require('../models');

exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const studentId = req.user.id;

    if (!quizId) {
      return res.status(400).json({
        message: 'quizId is required'
      });
    }

    // 1️ Verify quiz exists
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    // 2️ Quiz must be published
    if (!quiz.isPublished) {
      return res.status(403).json({
        message: 'Quiz is not published yet'
      });
    }

    // 3️ Prevent multiple attempts
    const existingAttempt = await QuizAttempt.findOne({
      where: {
        quizId,
        studentId
      }
    });

    if (existingAttempt) {
      return res.status(409).json({
        message: 'You have already started this quiz'
      });
    }

    // 4️ Create quiz attempt
    const attempt = await QuizAttempt.create({
      quizId,
      studentId,
      score: 0,
      startedAt: new Date(),
      submittedAt: null
    });

    res.status(201).json(attempt);

  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({
      message: 'Failed to start quiz'
    });
  }
};

exports.getAttemptResult = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findByPk(req.params.attemptId, {
      include: [{
        model: Quiz,
        as: 'quiz',
        include: [{
          model: Course,
          as: 'course',
          attributes: ['teacherId']
        }]
      }]
    });

    if (!attempt || !attempt.quiz || !attempt.quiz.course) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    const isStudentOwner = Number(attempt.studentId) === Number(req.user.id);
    const isTeacherOwner = (
      req.user.role === 'teacher' &&
      Number(attempt.quiz.course.teacherId) === Number(req.user.id)
    );
    const isAdmin = req.user.role === 'admin';

    if (!isStudentOwner && !isTeacherOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not allowed to view this result' });
    }

    const totalQuestions = await QuizQuestion.count({
      where: { quizId: attempt.quizId }
    });

    const correctAnswers = await QuizAnswer.count({
      where: {
        attemptId: attempt.id,
        isCorrect: true
      }
    });

    return res.json({
      id: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      totalQuestions,
      correctAnswers,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt
    });
  } catch (error) {
    console.error('Get quiz result error:', error);
    return res.status(500).json({ message: 'Failed to load quiz result' });
  }
};
