const Quiz = require('../models/quiz.model');
const Course = require('../models/course.model');

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
