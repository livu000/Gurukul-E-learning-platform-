const { QuizAttempt, QuizAnswer, QuizOption, QuizQuestion, Quiz } = require('../models');

exports.submitQuiz = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    if (!attemptId || !Array.isArray(answers) || !answers.length) return res.status(400).json({ message: 'attemptId and answers are required' });
    const attempt = await QuizAttempt.findByPk(attemptId, { include: [{ model: Quiz, as: 'quiz' }] });
    if (!attempt?.quiz) return res.status(404).json({ message: 'Quiz attempt not found' });
    if (Number(attempt.studentId) !== Number(req.user.id)) return res.status(403).json({ message: 'You are not allowed to submit this attempt' });
    if (attempt.submittedAt) return res.status(409).json({ message: 'Quiz already submitted' });
    if (attempt.quiz.timeLimitMinutes && attempt.startedAt && Date.now() > new Date(attempt.startedAt).getTime() + (attempt.quiz.timeLimitMinutes * 60 * 1000)) return res.status(400).json({ message: 'Quiz time limit exceeded' });

    const rows = [];
    let totalScore = 0;
    for (const item of answers) {
      const question = await QuizQuestion.findByPk(item.questionId);
      if (!question || Number(question.quizId) !== Number(attempt.quizId)) return res.status(400).json({ message: `Invalid question ${item.questionId}` });
      let isCorrect = false;
      let selectedOptionId = item.selectedOptionId || null;
      let answerText = item.answerText || null;
      if (question.questionType === 'short_answer') {
        isCorrect = String(answerText || '').trim().toLowerCase() === String(question.correctTextAnswer || '').trim().toLowerCase();
      } else {
        const option = await QuizOption.findByPk(selectedOptionId);
        if (!option || Number(option.questionId) !== Number(question.id)) return res.status(400).json({ message: `Invalid option for question ${question.id}` });
        isCorrect = Boolean(option.isCorrect);
      }
      const marksAwarded = isCorrect ? Number(question.marks || 0) : 0;
      totalScore += marksAwarded;
      rows.push({ attemptId, questionId: question.id, selectedOptionId, answerText, isCorrect, marksAwarded });
    }

    await QuizAnswer.bulkCreate(rows);
    await attempt.update({ score: totalScore, totalMarks: attempt.quiz.totalMarks || totalScore, isPassed: totalScore >= Number(attempt.quiz.passingMarks || 0), submittedAt: new Date(), status: 'evaluated', evaluatedAt: new Date(), timeSpentSeconds: attempt.startedAt ? Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)) : 0 });
    return res.json({ message: 'Quiz submitted successfully', score: totalScore, totalMarks: Number(attempt.totalMarks || attempt.quiz.totalMarks || totalScore), isPassed: attempt.isPassed });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ message: 'Failed to submit quiz' });
  }
};
