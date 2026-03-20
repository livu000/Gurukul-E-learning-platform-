const { Quiz, QuizQuestion, QuizOption, Course } = require('../models');

/**
 * Add question to quiz
 * Teacher only
 */
exports.addQuestion = async (req, res) => {
  try {
    const { quizId, questionText, marks } = req.body;
    const teacherId = req.user.id;

    if (!quizId || !questionText) {
      return res.status(400).json({
        message: 'quizId and questionText are required'
      });
    }

    // 1️ Verify quiz exists
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // 2️ Ownership check
    if (quiz.createdBy !== teacherId) {
      return res.status(403).json({
        message: 'You are not allowed to modify this quiz'
      });
    }

    // 3️ Create question
    const question = await QuizQuestion.create({
      quizId,
      questionText,
      marks: marks || 1
    });

    // 4️ Update total marks
    quiz.totalMarks += question.marks;
    await quiz.save();

    res.status(201).json(question);

  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      message: 'Failed to add question'
    });
  }
};

/**
 * Add MCQ options to question
 * Teacher only
 */
exports.addOptions = async (req, res) => {
  try {
    const { questionId, options } = req.body;
    const teacherId = req.user.id;

    if (!questionId || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: 'questionId and minimum 2 options required'
      });
    }

    // 1️ Verify question exists
    const question = await QuizQuestion.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // 2️ Verify quiz ownership
    const quiz = await Quiz.findByPk(question.quizId);
    if (quiz.createdBy !== teacherId) {
      return res.status(403).json({
        message: 'You are not allowed to add options to this quiz'
      });
    }

    // 3️ Enforce single correct option
    const correctOptions = options.filter(o => o.isCorrect === true);
    if (correctOptions.length !== 1) {
      return res.status(400).json({
        message: 'Exactly one option must be correct'
      });
    }

    // 4️ Insert options
    const createdOptions = await QuizOption.bulkCreate(
      options.map(o => ({
        questionId,
        optionText: o.optionText,
        isCorrect: o.isCorrect || false
      }))
    );

    res.status(201).json(createdOptions);

  } catch (error) {
    console.error('Add options error:', error);
    res.status(500).json({
      message: 'Failed to add options'
    });
  }
};

exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{
        model: Course,
        as: 'course',
        attributes: ['teacherId']
      }]
    });

    if (!quiz || !quiz.course) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.user.role === 'student' && !quiz.isPublished) {
      return res.status(403).json({ message: 'Quiz is not published yet' });
    }

    if (
      req.user.role === 'teacher' &&
      Number(quiz.course.teacherId) !== Number(req.user.id)
    ) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const optionAttributes = req.user.role === 'student'
      ? ['id', 'optionText']
      : ['id', 'optionText', 'isCorrect'];

    const questions = await QuizQuestion.findAll({
      where: { quizId: quiz.id },
      include: [{
        model: QuizOption,
        as: 'options',
        attributes: optionAttributes
      }],
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });

    res.json(questions);
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({ message: 'Failed to load quiz questions' });
  }
};
