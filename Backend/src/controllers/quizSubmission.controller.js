const { QuizAttempt, QuizAnswer, QuizOption, QuizQuestion, Quiz } = require('../models');
const sequelize = require('../config/db');

exports.submitQuiz = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const attemptId =Number(req.params.attemptId || req.body.attemptId);
    const {  answers } = req.body;
    if (!attemptId || !Array.isArray(answers) || !answers.length) {
      await transaction.rollback();
      return res.status(400).json({ message: 'attemptId and answers are required' });
    }
    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [{ model: Quiz, as: 'quiz' }],
      transaction
    });
    if (!attempt?.quiz) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }
    if (Number(attempt.studentId) !== Number(req.user.id)) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You are not allowed to submit this attempt' });
    }
    if (attempt.submittedAt) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Quiz already submitted' });
    }
    if (attempt.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(409).json({ message: 'Quiz attempt is not active' });
    }
    if (attempt.quiz.timeLimitMinutes && attempt.startedAt && Date.now() > new Date(attempt.startedAt).getTime() + (attempt.quiz.timeLimitMinutes * 60 * 1000)) {
      await attempt.update({ status: 'expired' }, { transaction });
      await transaction.commit();
      return res.status(400).json({ message: 'Quiz time limit exceeded' });
    }

    const rows = [];
    let totalScore = 0;
    for (const item of answers) {
      const question = await QuizQuestion.findByPk(item.questionId, { transaction });
      if (!question || Number(question.quizId) !== Number(attempt.quizId)) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid question ${item.questionId}` });
      }
      let isCorrect = false;
      let selectedOptionId = item.selectedOptionId || null;
      let answerText = item.answerText || null;
      if (question.questionType === 'short_answer') {
        isCorrect = String(answerText || '').trim().toLowerCase() === String(question.correctTextAnswer || '').trim().toLowerCase();
      } else {
        const option = await QuizOption.findByPk(selectedOptionId, { transaction });
        if (!option || Number(option.questionId) !== Number(question.id)) {
          await transaction.rollback();
          return res.status(400).json({ message: `Invalid option for question ${question.id}` });
        }
        isCorrect = Boolean(option.isCorrect);
      }
      const marksAwarded = isCorrect ? Number(question.marks || 0) : 0;
      totalScore += marksAwarded;
      rows.push({ attemptId, questionId: question.id, selectedOptionId, answerText, isCorrect, marksAwarded });
    }

    await QuizAnswer.destroy({ where: { attemptId }, transaction });
    await QuizAnswer.bulkCreate(rows, { transaction });
    await attempt.update({
      score: totalScore,
      totalMarks: attempt.quiz.totalMarks || totalScore,
      isPassed: totalScore >= Number(attempt.quiz.passingMarks || 0),
      submittedAt: new Date(),
      status: 'evaluated',
      evaluatedAt: new Date(),
      timeSpentSeconds: attempt.startedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000))
        : 0
    }, { transaction });

    await transaction.commit();

    const payload = {
      message: 'Quiz submitted successfully',
      score: totalScore,
      totalMarks: Number(attempt.quiz.totalMarks || totalScore),
      isPassed: totalScore >= Number(attempt.quiz.passingMarks || 0)
    };

    if (!attempt.quiz.showResultsImmediately) {
      delete payload.score;
      delete payload.totalMarks;
      delete payload.isPassed;
      payload.message = 'Quiz submitted successfully. Results will be available later.';
    }

    return res.json(payload);
  } catch (error) {
    console.error('Submit quiz error:', error);
    await transaction.rollback();
    return res.status(500).json({ message: 'Failed to submit quiz' });
  }
};
