const { Quiz, QuizQuestion, QuizOption, Course } = require('../models');
const { logAudit } = require('../utils/audit.util');
const { canManageCourse, getNextSortOrder, syncQuizTotalMarks } = require('../utils/lms.util');

async function getManagedQuiz(quizId, reqUser) {
  const quiz = await Quiz.findByPk(quizId, {
    include: [{ model: Course, as: 'course', attributes: ['id', 'teacherId'] }]
  });

  if (!quiz?.course) return { error: { status: 404, message: 'Quiz not found' } };
  if (!canManageCourse(reqUser, quiz.course)) {
    return { error: { status: 403, message: 'You are not allowed to modify this quiz' } };
  }

  return { quiz };
}

exports.addQuestion = async (req, res) => {
  try {
    const { quizId, questionText } = req.body;
    if (!quizId || !questionText?.trim()) {
      return res.status(400).json({ message: 'quizId and questionText are required' });
    }

    const { quiz, error } = await getManagedQuiz(quizId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const question = await QuizQuestion.create({
      quizId,
      questionText: questionText.trim(),
      questionType: req.body.questionType || 'mcq',
      correctTextAnswer: req.body.correctTextAnswer || null,
      explanation: req.body.explanation || null,
      marks: Number(req.body.marks || 1),
      sortOrder: Number(req.body.sortOrder || await getNextSortOrder(QuizQuestion, { quizId })),
      isRequired: req.body.isRequired === undefined ? true : Boolean(req.body.isRequired)
    });

    await syncQuizTotalMarks(quizId);
    await logAudit({
      req,
      action: 'CREATE_QUIZ_QUESTION',
      entityType: 'quiz_questions',
      entityId: question.id,
      newData: question.toJSON()
    });

    return res.status(201).json(question);
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ message: 'Failed to add question' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.findByPk(req.params.questionId, {
      include: [{ model: Quiz, as: 'quiz', include: [{ model: Course, as: 'course', attributes: ['id', 'teacherId'] }] }]
    });

    if (!question?.quiz?.course) return res.status(404).json({ message: 'Question not found' });
    if (!canManageCourse(req.user, question.quiz.course)) {
      return res.status(403).json({ message: 'You are not allowed to update this question' });
    }

    const oldData = question.toJSON();
    await question.update({
      questionText: req.body.questionText?.trim() || question.questionText,
      questionType: req.body.questionType || question.questionType,
      correctTextAnswer: req.body.correctTextAnswer ?? question.correctTextAnswer,
      explanation: req.body.explanation ?? question.explanation,
      marks: req.body.marks ?? question.marks,
      sortOrder: req.body.sortOrder ?? question.sortOrder,
      isRequired: req.body.isRequired ?? question.isRequired
    });

    await syncQuizTotalMarks(question.quizId);
    await logAudit({
      req,
      action: 'UPDATE_QUIZ_QUESTION',
      entityType: 'quiz_questions',
      entityId: question.id,
      oldData,
      newData: question.toJSON()
    });

    return res.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({ message: 'Failed to update question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.findByPk(req.params.questionId, {
      include: [{ model: Quiz, as: 'quiz', include: [{ model: Course, as: 'course', attributes: ['id', 'teacherId'] }] }]
    });

    if (!question?.quiz?.course) return res.status(404).json({ message: 'Question not found' });
    if (!canManageCourse(req.user, question.quiz.course)) {
      return res.status(403).json({ message: 'You are not allowed to delete this question' });
    }

    const oldData = question.toJSON();
    await QuizOption.destroy({ where: { questionId: question.id } });
    await question.destroy();
    await syncQuizTotalMarks(question.quizId);

    await logAudit({
      req,
      action: 'DELETE_QUIZ_QUESTION',
      entityType: 'quiz_questions',
      entityId: question.id,
      oldData
    });

    return res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ message: 'Failed to delete question' });
  }
};

exports.addOptions = async (req, res) => {
  try {
    const { questionId, options } = req.body;
    if (!questionId || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'questionId and minimum 2 options are required' });
    }

    const question = await QuizQuestion.findByPk(questionId, {
      include: [{ model: Quiz, as: 'quiz', include: [{ model: Course, as: 'course', attributes: ['id', 'teacherId'] }] }]
    });

    if (!question?.quiz?.course) return res.status(404).json({ message: 'Question not found' });
    if (!canManageCourse(req.user, question.quiz.course)) {
      return res.status(403).json({ message: 'You are not allowed to add options to this quiz' });
    }

    await QuizOption.destroy({ where: { questionId } });
    const createdOptions = await QuizOption.bulkCreate(options.map((option, index) => ({
      questionId,
      optionText: option.optionText,
      isCorrect: Boolean(option.isCorrect),
      sortOrder: Number(option.sortOrder || index + 1)
    })));

    return res.status(201).json(createdOptions);
  } catch (error) {
    console.error('Add options error:', error);
    return res.status(500).json({ message: 'Failed to add options' });
  }
};

exports.reorderQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const { quiz, error } = await getManagedQuiz(req.params.quizId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ message: 'questions array is required' });
    }

    await Promise.all(
      questions.map((item, index) => QuizQuestion.update(
        { sortOrder: Number(item.sortOrder || index + 1) },
        { where: { id: item.id, quizId: quiz.id } }
      ))
    );

    const updated = await QuizQuestion.findAll({
      where: { quizId: quiz.id },
      include: [{ model: QuizOption, as: 'options' }],
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    return res.json(updated);
  } catch (error) {
    console.error('Reorder questions error:', error);
    return res.status(500).json({ message: 'Failed to reorder questions' });
  }
};

exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{ model: Course, as: 'course', attributes: ['teacherId'] }]
    });
    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role === 'student' && !quiz.isPublished) {
      return res.status(403).json({ message: 'Quiz is not published yet' });
    }
    if ((req.user.role === 'teacher' || req.user.role === 'admin') && !canManageCourse(req.user, quiz.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const optionAttributes = req.user.role === 'student'
      ? ['id', 'optionText', 'sortOrder']
      : ['id', 'optionText', 'isCorrect', 'sortOrder'];

    const questions = await QuizQuestion.findAll({
      where: { quizId: quiz.id },
      include: [{ model: QuizOption, as: 'options', attributes: optionAttributes }],
      order: quiz.shuffleQuestions ? [] : [['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    const payload = quiz.shuffleQuestions
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;

    return res.json(payload);
  } catch (error) {
    console.error('Get quiz questions error:', error);
    return res.status(500).json({ message: 'Failed to load quiz questions' });
  }
};
