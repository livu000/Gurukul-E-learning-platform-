const { Enrollment, Course, Payment } = require('../models');

exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.status !== 'published') return res.status(400).json({ message: 'Only published courses can be enrolled' });
    if (course.isPaid) return res.status(400).json({ message: 'Paid course - complete payment first' });
    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { userId: req.user.id, courseId },
      defaults: { userId: req.user.id, courseId, isPaid: false, status: 'active', enrolledAt: new Date() }
    });
    if (!created) return res.status(409).json({ message: 'Already enrolled in this course' });
    course.enrollCount = Number(course.enrollCount || 0) + 1;
    await course.save();
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
