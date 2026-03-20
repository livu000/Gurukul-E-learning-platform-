const { Quiz, Course, Enrollment } = require('../models');

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, timeLimit } = req.body;
    const teacherId = req.user.id;

    // 1️ Validate input
    if (!courseId || !title) {
      return res.status(400).json({
        message: 'courseId and title are required'
      });
    }

    // 2️ Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // 3️ Verify teacher owns the course
    if (course.teacherId !== teacherId) {
      return res.status(403).json({
        message: 'You are not allowed to add quiz to this course'
      });
    }

    // 4️ Create quiz (DRAFT)
    const quiz = await Quiz.create({
      courseId,
      title,
      description,
      timeLimit,
      createdBy: teacherId,
      isPublished: false,
      totalMarks: 0
    });

    // 5️ Return quiz
    res.status(201).json(quiz);

  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      message: 'Failed to create quiz'
    });
  }
};

exports.getQuizzesByCourse = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const where = { courseId };

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId,
          status: 'active'
        }
      });

      if (!enrollment) {
        return res.status(403).json({ message: 'You are not enrolled in this course' });
      }

      where.isPublished = true;
    }

    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const quizzes = await Quiz.findAll({
      where,
      order: [['id', 'DESC']]
    });

    return res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes by course error:', error);
    return res.status(500).json({ message: 'Failed to load quizzes' });
  }
};

exports.getTeacherQuizzes = async (req, res) => {
  try {
    const where = req.user.role === 'teacher'
      ? { createdBy: req.user.id }
      : {};

    const quizzes = await Quiz.findAll({
      where,
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'teacherId']
      }],
      order: [['id', 'DESC']]
    });

    return res.json(quizzes);
  } catch (error) {
    console.error('Get teacher quizzes error:', error);
    return res.status(500).json({ message: 'Failed to load quizzes' });
  }
};

exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{
        model: Course,
        as: 'course'
      }]
    });

    if (!quiz || !quiz.course) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.user.role === 'teacher' && Number(quiz.course.teacherId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    quiz.isPublished = req.body.isPublished === undefined
      ? true
      : Boolean(req.body.isPublished);

    await quiz.save();

    return res.json(quiz);
  } catch (error) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({ message: 'Failed to update quiz publish status' });
  }
};
