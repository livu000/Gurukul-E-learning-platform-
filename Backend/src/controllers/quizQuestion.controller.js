const { Quiz, QuizQuestion, QuizOption, Course } = require('../models');

async function syncQuizMarks(quizId) {
  const questions = await QuizQuestion.findAll({ where: { quizId }, attributes: ['marks'] });
  const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
  await Quiz.update({ totalMarks }, { where: { id: quizId } });
}

exports.addQuestion = async (req, res) => {
  try {
    const { quizId, questionText } = req.body;
    if (!quizId || !questionText?.trim()) return res.status(400).json({ message: 'quizId and questionText are required' });
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (Number(quiz.createdBy) !== Number(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You are not allowed to modify this quiz' });
    const question = await QuizQuestion.create({
      quizId,
      questionText: questionText.trim(),
      questionType: req.body.questionType || 'mcq',
      correctTextAnswer: req.body.correctTextAnswer || null,
      explanation: req.body.explanation || null,
      marks: Number(req.body.marks || 1),
      sortOrder: Number(req.body.sortOrder || 1),
      isRequired: req.body.isRequired === undefined ? true : Boolean(req.body.isRequired)
    });
    await syncQuizMarks(quizId);
    return res.status(201).json(question);
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ message: 'Failed to add question' });
  }
};

exports.addOptions = async (req, res) => {
  try {
    const { questionId, options } = req.body;
    if (!questionId || !Array.isArray(options) || options.length < 2) return res.status(400).json({ message: 'questionId and minimum 2 options required' });
    const question = await QuizQuestion.findByPk(questionId, { include: [{ model: Quiz, as: 'quiz' }] });
    if (!question?.quiz) return res.status(404).json({ message: 'Question not found' });
    if (Number(question.quiz.createdBy) !== Number(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You are not allowed to add options to this quiz' });
    await QuizOption.destroy({ where: { questionId } });
    const createdOptions = await QuizOption.bulkCreate(options.map((option, index) => ({ questionId, optionText: option.optionText, isCorrect: Boolean(option.isCorrect), sortOrder: Number(option.sortOrder || index + 1) })));
    return res.status(201).json(createdOptions);
  } catch (error) {
    console.error('Add options error:', error);
    return res.status(500).json({ message: 'Failed to add options' });
  }
};

exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId, { include: [{ model: Course, as: 'course', attributes: ['teacherId'] }] });
    if (!quiz?.course) return res.status(404).json({ message: 'Quiz not found' });
    if (req.user.role === 'student' && !quiz.isPublished) return res.status(403).json({ message: 'Quiz is not published yet' });
    if (req.user.role === 'teacher' && Number(quiz.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    const optionAttributes = req.user.role === 'student' ? ['id', 'optionText', 'sortOrder'] : ['id', 'optionText', 'isCorrect', 'sortOrder'];
    const questions = await QuizQuestion.findAll({ where: { quizId: quiz.id }, include: [{ model: QuizOption, as: 'options', attributes: optionAttributes }], order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    return res.json(questions);
  } catch (error) {
    console.error('Get quiz questions error:', error);
    return res.status(500).json({ message: 'Failed to load quiz questions' });
  }
};
