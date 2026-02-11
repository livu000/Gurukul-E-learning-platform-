const { Enrollment, Course } = require('../models');

/**
 * ENROLL IN A COURSE
 * Student-only (RBAC enforced in routes later)
 */
exports.enrollInCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    // 1️ Validate course existence
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // 2️ Prevent duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: courseId
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        message: 'Already enrolled in this course'
      });
    }

    // 3️ Create enrollment
    const enrollment = await Enrollment.create({
      user_id: userId,
      course_id: courseId
    });

    return res.status(201).json(enrollment);

  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({
      message: 'Failed to enroll in course'
    });
  }
};

/**
 * GET MY ENROLLMENTS
 * Returns all courses the student is enrolled in
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: {
        user_id: req.user.id
      }
    });

    return res.json(enrollments);

  } catch (error) {
    console.error('Fetch enrollments error:', error);
    return res.status(500).json({
      message: 'Failed to fetch enrollments'
    });
  }
};
