const { Enrollment, Lesson, Module } = require('../models');

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
      courseId = req.params.courseId;
    }

    // Case 2: lessonId → module → course
    if (!courseId && req.params.lessonId) {
      const lesson = await Lesson.findByPk(req.params.lessonId, {
        include: {
          model: Module,
          attributes: ['course_id']
        }
      });

      if (!lesson || !lesson.Module) {
        return res.status(404).json({
          message: 'Lesson not found'
        });
      }

      courseId = lesson.Module.course_id;
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
        user_id: userId,
        course_id: courseId,
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
