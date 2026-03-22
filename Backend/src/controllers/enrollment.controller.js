const { Op } = require('sequelize');
const { Enrollment, Course, Payment, User } = require('../models');
const { canManageCourse } = require('../utils/lms.util');
const { logAudit } = require('../utils/audit.util');

exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.status !== 'published') return res.status(400).json({ message: 'Only published courses can be enrolled' });
    if (course.isPaid) {
      const paymentId = Number(req.body.paymentId);

      if (!paymentId) {
        return res.status(400).json({ message: 'paymentId is required for paid courses' });
      }

      const payment = await Payment.findOne({
        where: {
          id: paymentId,
          userId: req.user.id,
          courseId,
          status: 'success'
        }
      });

      if (!payment) {
        return res.status(400).json({ message: 'Paid course - complete payment first' });
      }
    }
    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { userId: req.user.id, courseId },
      defaults: { userId: req.user.id, courseId, isPaid: false, status: 'active', enrolledAt: new Date() }
    });
    if (!created) return res.status(409).json({ message: 'Already enrolled in this course' });
    course.enrollCount = Number(course.enrollCount || 0) + 1;
    await course.save();
    await logAudit({
      req,
      action: 'ENROLL_IN_COURSE',
      entityType: 'enrollments',
      entityId: enrollment.id,
      newData: enrollment.toJSON()
    });
    return res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ message: 'Failed to enroll in course' });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({ where: { userId: req.user.id }, include: [{ model: Course, as: 'course' }, { model: Payment, as: 'payment' }], order: [['updatedAt', 'DESC']] });
    return res.json(enrollments);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    return res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
};

exports.getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId: course.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'status'] },
        { model: Payment, as: 'payment' }
      ],
      order: [['updated_at', 'DESC']]
    });

    return res.json(enrollments);
  } catch (error) {
    console.error('Fetch course enrollments error:', error);
    return res.status(500).json({ message: 'Failed to fetch course enrollments' });
  }
};

exports.getCompletionRecords = async (req, res) => {
  try {
    const completions = await Enrollment.findAll({
      where: {
        status: { [Op.in]: ['completed', 'active'] }
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    return res.json(completions);
  } catch (error) {
    console.error('Fetch completion records error:', error);
    return res.status(500).json({ message: 'Failed to fetch completion records' });
  }
};
