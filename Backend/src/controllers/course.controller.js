const { Op } = require('sequelize');
const { Course, Module, Lesson, Enrollment, User } = require('../models');

function buildCourseWhere(user, query) {
  const where = {};
  if (query.q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query.q}%` } },
      { subtitle: { [Op.like]: `%${query.q}%` } },
      { description: { [Op.like]: `%${query.q}%` } }
    ];
  }
  if (query.category) where.category = query.category;
  if (query.level) where.level = query.level;
  if (query.isPaid !== undefined) where.isPaid = ['true', '1', true].includes(query.isPaid);
  if (user?.role === 'teacher') where.teacherId = user.id;
  if (!user || user.role === 'student') where.status = 'published';
  return where;
}

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: buildCourseWhere(req.user, req.query),
      include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }],
      order: [['updatedAt', 'DESC'], ['id', 'DESC']]
    });
    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email', 'bio', 'profileImage'] },
        { model: Module, as: 'modules', include: [{ model: Lesson, as: 'lessons' }] }
      ],
      order: [[{ model: Module, as: 'modules' }, 'sortOrder', 'ASC']]
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = req.user;
    const canManage = Boolean(user && (user.role === 'admin' || (user.role === 'teacher' && Number(course.teacherId) === Number(user.id))));
    let enrollment = null;
    if (user?.role === 'student') {
      enrollment = await Enrollment.findOne({ where: { userId: user.id, courseId: course.id, status: { [Op.in]: ['active', 'completed'] } } });
    }
    const isEnrolled = Boolean(enrollment);
    const hasAccess = canManage || isEnrolled;

    if (course.status !== 'published' && !canManage) return res.status(404).json({ message: 'Course not found' });

    const courseJson = course.toJSON();
    courseJson.modules = (courseJson.modules || []).sort((a, b) => a.sortOrder - b.sortOrder).map((module) => ({
      ...module,
      lessons: (module.lessons || [])
        .filter((lesson) => canManage || hasAccess || lesson.isPreview)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    })).filter((module) => canManage || hasAccess || module.lessons.length > 0);

    return res.json({ ...courseJson, isEnrolled, canManage, hasAccess });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch course' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title?.trim()) return res.status(400).json({ message: 'Title is required' });
    const isPaid = Boolean(body.isPaid);
    const price = isPaid ? Number(body.price || 0) : 0;
    if (isPaid && (!Number.isFinite(price) || price <= 0)) return res.status(400).json({ message: 'Paid courses require a valid price' });

    const teacherId = req.user.role === 'admin' && body.teacherId ? Number(body.teacherId) : req.user.id;
    const course = await Course.create({
      teacherId,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      description: body.description?.trim() || null,
      category: body.category?.trim() || null,
      level: body.level || null,
      language: body.language?.trim() || 'English',
      thumbnailUrl: body.thumbnailUrl || null,
      isPaid,
      price,
      currency: body.currency || 'INR',
      status: 'draft',
      approvalStatus: 'pending'
    });
    return res.status(201).json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Course creation failed' });
  }
};

exports.submitForReview = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (Number(course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    await course.update({ status: 'review', approvalStatus: 'pending', rejectionReason: null });
    return res.json({ message: 'Course submitted for review', course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Submission failed' });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const action = req.body.action || req.body.status;
    if (!['approved', 'published', 'rejected', 'draft'].includes(action)) return res.status(400).json({ message: 'Invalid course action' });

    if (action === 'approved') {
      await course.update({ approvalStatus: 'approved', approvedBy: req.user.id, approvedAt: new Date(), status: 'review', rejectionReason: null });
    } else if (action === 'published') {
      if (course.approvalStatus !== 'approved') return res.status(400).json({ message: 'Course must be approved before publishing' });
      await course.update({ status: 'published' });
    } else if (action === 'rejected') {
      await course.update({ status: 'rejected', approvalStatus: 'rejected', rejectionReason: req.body.rejectionReason || 'Rejected by admin' });
    } else {
      await course.update({ status: 'draft', approvalStatus: 'pending', approvedBy: null, approvedAt: null, rejectionReason: null });
    }

    return res.json({ message: 'Course status updated', course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Status update failed' });
  }
};
