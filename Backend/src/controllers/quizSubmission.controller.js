const { QuizAttempt, QuizAnswer, QuizOption, QuizQuestion, Quiz } = require('../models');

exports.submitQuiz = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const studentId = req.user.id;

    if (!attemptId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: 'attemptId and answers are required'
      });
    }

    // 1️ Verify attempt exists
    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [{
        model: Quiz,
        as: 'quiz'
      }]
    });
    if (!attempt) {
      return res.status(404).json({
        message: 'Quiz attempt not found'
      });
    }

    // 2️ Ownership check
    if (attempt.studentId !== studentId) {
      return res.status(403).json({
        message: 'You are not allowed to submit this attempt'
      });
    }

    // 3️ Prevent resubmission
    if (attempt.submittedAt) {
      return res.status(409).json({
        message: 'Quiz already submitted'
      });
    }

    if (
      attempt.quiz?.timeLimit &&
      attempt.startedAt &&
      (
        Date.now() >
        new Date(attempt.startedAt).getTime() + (attempt.quiz.timeLimit * 60 * 1000)
      )
    ) {
      return res.status(400).json({
        message: 'Quiz time limit exceeded'
      });
    }

    let totalScore = 0;
    const answerRows = [];
    const answeredQuestions = new Set();

    // 4️ Evaluate each answer
    for (const ans of answers) {
      const questionId = Number(ans.questionId);
      const selectedOptionId = Number(ans.selectedOptionId);

      if (!questionId || !selectedOptionId) {
        return res.status(400).json({
          message: 'Each answer must include questionId and selectedOptionId'
        });
      }

      if (answeredQuestions.has(questionId)) {
        return res.status(400).json({
          message: `Duplicate answer submitted for question ${questionId}`
        });
      }

      answeredQuestions.add(questionId);

      const question = await QuizQuestion.findByPk(questionId);
      if (!question || Number(question.quizId) !== Number(attempt.quizId)) {
        return res.status(400).json({
          message: `Invalid question ${questionId}`
        });
      }

      // Verify option exists
      const option = await QuizOption.findByPk(selectedOptionId);
      if (!option || Number(option.questionId) !== Number(question.id)) {
        return res.status(400).json({
          message: `Invalid option selected for question ${questionId}`
        });
      }

      const isCorrect = option.isCorrect === true;

      if (isCorrect) {
        totalScore += question.marks;
      }

      answerRows.push({
        attemptId,
        questionId,
        selectedOptionId,
        isCorrect
      });
    }

    // 5️ Save answers
    await QuizAnswer.bulkCreate(answerRows);

    // 6️ Update attempt
    attempt.score = totalScore;
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json({
      message: 'Quiz submitted successfully',
      score: totalScore
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      message: 'Failed to submit quiz'
    });
  }
};
