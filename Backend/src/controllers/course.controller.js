const { Course, Module, Lesson, Enrollment, User } = require('../models');

/**
 * GET /api/courses
 * Role-based listing
 */
exports.getAllCourses = async (req, res) => {
  try {
    const user = req.user;
    let where = {};

    if (user) {
      if (user.role === 'teacher') {
        where.teacherId = user.id;
      } else if (user.role === 'student') {
        where.status = 'published';
      }
      // admin → no filter
    } else {
      // public users
      where.status = 'published';
    }

    const courses = await Course.findAll({
      where,
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }],
      order: [['id', 'DESC']]
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

/**
 * GET /api/courses/:id
 * Public for published courses, privileged for teacher owner/admin
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Module,
          as: 'modules',
          include: [{
            model: Lesson,
            as: 'lessons'
          }],
          order: [['sortOrder', 'ASC']]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = req.user;
    const isPrivilegedUser = Boolean(
      user &&
      (
        user.role === 'admin' ||
        (user.role === 'teacher' && Number(course.teacherId) === Number(user.id))
      )
    );

    if (course.status !== 'published' && !isPrivilegedUser) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let isEnrolled = false;

    if (user?.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: user.id,
          courseId: course.id,
          status: 'active'
        }
      });

      isEnrolled = Boolean(enrollment);
    }

    res.json({
      ...course.toJSON(),
      isEnrolled,
      canManage: isPrivilegedUser,
      hasAccess: isPrivilegedUser || isEnrolled
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
};

/**
 * POST /api/courses
 * Teacher / Admin only
 */
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      isPaid = false,
      price = 0,
      teacherId: requestedTeacherId
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const normalizedIsPaid = Boolean(isPaid);
    const normalizedPrice = normalizedIsPaid ? Number(price) : 0;

    if (normalizedIsPaid && (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0)) {
      return res.status(400).json({ message: 'Paid courses require a valid price' });
    }

    const teacherId = req.user.role === 'admin' && requestedTeacherId
      ? Number(requestedTeacherId)
      : req.user.id;

    const course = await Course.create({
      title,
      description,
      teacherId,
      isPaid: normalizedIsPaid,
      price: normalizedPrice
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Course creation failed' });
  }
};

/**
 * Teacher → submit course for review
 * PATCH /api/courses/:id/submit
 */
exports.submitForReview = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (course.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft courses can be submitted' });
    }

    course.status = 'review';
    await course.save();

    res.json({ message: 'Course submitted for review' });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed' });
  }
};

/**
 * Admin → approve or reject course
 * PATCH /api/courses/:id/status
 */
exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['published', 'draft'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'review') {
      return res.status(400).json({ message: 'Course is not under review' });
    }

    course.status = status;
    await course.save();

    res.json({ message: `Course ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Status update failed' });
  }
};
