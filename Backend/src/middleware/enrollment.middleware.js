const {
  Enrollment,
  Lesson,
  Module,
  Quiz,
  QuizAttempt,
  Assignment
} = require('../models');

/**
 * Ensure the current user is enrolled in the course
 * Applies ONLY to students
 * Teachers/Admins bypass automatically
 */
exports.ensureEnrolled = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Teachers & Admins bypass enrollment check
    if (role === 'teacher' || role === 'admin') {
      return next();
    }

    let courseId = null;

    /* ==============================
       Resolve courseId safely
    ============================== */

    // Case 1: courseId directly available
    if (req.params.courseId) {
      courseId = Number(req.params.courseId);
    }

    if (!courseId && req.body.courseId) {
      courseId = Number(req.body.courseId);
    }

    // Case 2: lessonId → module → course
    if (!courseId && req.params.lessonId) {
      const lesson = await Lesson.findByPk(req.params.lessonId, {
        include: {
          model: Module,
          as: 'module',
          attributes: ['courseId']
        }
      });

      if (!lesson || !lesson.module) {
        return res.status(404).json({
          message: 'Lesson not found'
        });
      }

      courseId = lesson.module.courseId;
    }

    if (!courseId && req.body.quizId) {
      const quiz = await Quiz.findByPk(req.body.quizId);

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      courseId = quiz.courseId;
    }

    if (!courseId && req.params.quizId) {
      const quiz = await Quiz.findByPk(req.params.quizId);

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      courseId = quiz.courseId;
    }

    if (!courseId && req.body.assignmentId) {
      const assignment = await Assignment.findByPk(req.body.assignmentId);

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      courseId = assignment.courseId;
    }

    const attemptId = req.body.quizAttemptId || req.body.attemptId || req.params.attemptId;

    if (!courseId && attemptId) {
      const attempt = await QuizAttempt.findByPk(attemptId, {
        include: {
          model: Quiz,
          as: 'quiz',
          attributes: ['courseId']
        }
      });

      if (!attempt || !attempt.quiz) {
        return res.status(404).json({ message: 'Quiz attempt not found' });
      }

      courseId = attempt.quiz.courseId;
    }

    if (!courseId) {
      return res.status(400).json({
        message: 'Unable to determine course for enrollment check'
      });
    }

    /* ==============================
       Enrollment verification
    ============================== */
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId,
        status: 'active'
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        message: 'You are not enrolled in this course'
      });
    }

    return next();

  } catch (error) {
    console.error('Enrollment middleware error:', error);
    return res.status(500).json({
      message: 'Enrollment verification failed'
    });
  }
};
