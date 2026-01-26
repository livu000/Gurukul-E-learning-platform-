const QuizAttempt = require('../models/quizAttempt.model');
const QuizAnswer = require('../models/quizAnswer.model');
const QuizOption = require('../models/quizOption.model');
const QuizQuestion = require('../models/quizQuestion.model');

exports.submitQuiz = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const studentId = req.user.id;

    if (!attemptId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: 'attemptId and answers are required'
      });
    }

    // 1️⃣ Verify attempt exists
    const attempt = await QuizAttempt.findByPk(attemptId);
    if (!attempt) {
      return res.status(404).json({
        message: 'Quiz attempt not found'
      });
    }

    // 2️⃣ Ownership check
    if (attempt.studentId !== studentId) {
      return res.status(403).json({
        message: 'You are not allowed to submit this attempt'
      });
    }

    // 3️⃣ Prevent resubmission
    if (attempt.submittedAt) {
      return res.status(409).json({
        message: 'Quiz already submitted'
      });
    }

    let totalScore = 0;
    const answerRows = [];

    // 4️⃣ Evaluate each answer
    for (const ans of answers) {
      const { questionId, selectedOptionId } = ans;

      // Verify option exists
      const option = await QuizOption.findByPk(selectedOptionId);
      if (!option) {
        return res.status(400).json({
          message: `Invalid option selected for question ${questionId}`
        });
      }

      const isCorrect = option.isCorrect === true;

      // Get question marks
      const question = await QuizQuestion.findByPk(questionId);
      if (!question) {
        return res.status(400).json({
          message: `Invalid question ${questionId}`
        });
      }

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

    // 5️⃣ Save answers
    await QuizAnswer.bulkCreate(answerRows);

    // 6️⃣ Update attempt
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
