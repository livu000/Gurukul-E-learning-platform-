const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quizAttempt.model');

exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const studentId = req.user.id;

    if (!quizId) {
      return res.status(400).json({
        message: 'quizId is required'
      });
    }

    // 1️⃣ Verify quiz exists
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    // 2️⃣ Quiz must be published
    if (!quiz.isPublished) {
      return res.status(403).json({
        message: 'Quiz is not published yet'
      });
    }

    // 3️⃣ Prevent multiple attempts
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

    // 4️⃣ Create quiz attempt
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
