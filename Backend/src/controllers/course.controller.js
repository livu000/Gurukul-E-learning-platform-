const { Op } = require('sequelize');
const { Course, Module, Lesson, Enrollment, User } = require('../models');
const { logAudit } = require('../utils/audit.util');
const {
  canManageCourse,
  getActiveEnrollment,
  publishCourseContent,
  syncCourseStats,
  validateCourseForReview
} = require('../utils/lms.util');

function parseBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
}

function buildCourseWhere(user, query = {}) {
  const where = {};
  const searchTerm = query.q?.trim();

  if (searchTerm) {
    where[Op.or] = [
      { title: { [Op.like]: `%${searchTerm}%` } },
      { subtitle: { [Op.like]: `%${searchTerm}%` } },
      { description: { [Op.like]: `%${searchTerm}%` } }
    ];
  }

  if (query.category) where.category = query.category;
  if (query.level) where.level = query.level;
  if (query.language) where.language = query.language;
  if (query.teacherId && user?.role === 'admin') where.teacherId = Number(query.teacherId);

  const isPaid = parseBoolean(query.isPaid);
  if (isPaid !== undefined) where.isPaid = isPaid;

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    where.price = {};
    if (Number.isFinite(minPrice)) where.price[Op.gte] = minPrice;
    if (Number.isFinite(maxPrice)) where.price[Op.lte] = maxPrice;
  }

  if (user?.role === 'teacher') {
    where.teacherId = user.id;
    if (query.status) where.status = query.status;
    if (query.approvalStatus) where.approvalStatus = query.approvalStatus;
    return where;
  }

  if (user?.role === 'admin') {
    if (query.status) where.status = query.status;
    if (query.approvalStatus) where.approvalStatus = query.approvalStatus;
    return where;
  }

  where.status = 'published';
  where.approvalStatus = 'approved';
  return where;
}

function normalizeCoursePayload(body = {}) {
  const isPaid = parseBoolean(body.isPaid) ?? false;
  const price = isPaid ? Number(body.price || 0) : 0;

  return {
    title: body.title?.trim(),
    subtitle: body.subtitle?.trim() || null,
    description: body.description?.trim() || null,
    category: body.category?.trim() || null,
    level: body.level || null,
    language: body.language?.trim() || null,
    thumbnailUrl: body.thumbnailUrl || null,
    isPaid,
    price,
    currency: body.currency || 'INR'
  };
}

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: buildCourseWhere(req.user, req.query),
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name'], required: false }
      ],
      order: [['updated_at', 'DESC'], ['id', 'DESC']]
    });

    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.role === 'admin' && req.query.teacherId
      ? Number(req.query.teacherId)
      : req.user.id;

    const courses = await Course.findAll({
      where: { teacherId },
      include: [{ model: User, as: 'approver', attributes: ['id', 'name'], required: false }],
      order: [['updated_at', 'DESC']]
    });

    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch teacher courses' });
  }
};

exports.getReviewQueue = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { status: 'review' },
      include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }],
      order: [['updated_at', 'DESC'], ['id', 'DESC']]
    });

    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch review queue' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email', 'bio', 'profileImage'] },
        { model: User, as: 'approver', attributes: ['id', 'name'], required: false },
        { model: Module, as: 'modules', include: [{ model: Lesson, as: 'lessons' }] }
      ]
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = req.user;
    const canManage = canManageCourse(user, course);
    const enrollment = user?.role === 'student'
      ? await getActiveEnrollment(user.id, course.id)
      : null;
    const isEnrolled = Boolean(enrollment);
    const hasAccess = canManage || isEnrolled;

    if (course.status !== 'published' && !canManage) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseJson = course.toJSON();
    courseJson.modules = (courseJson.modules || [])
      .filter((module) => canManage || module.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((module) => ({
        ...module,
        lessons: (module.lessons || [])
          .filter((lesson) => canManage || hasAccess || lesson.isPreview)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      }))
      .filter((module) => canManage || module.lessons.length > 0);

    return res.json({
      ...courseJson,
      isEnrolled,
      canManage,
      hasAccess
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch course' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body);
    if (!payload.title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (payload.isPaid && (!Number.isFinite(payload.price) || payload.price <= 0)) {
      return res.status(400).json({ message: 'Paid courses require a valid price' });
    }

    const teacherId = req.user.role === 'admin' && req.body.teacherId
      ? Number(req.body.teacherId)
      : req.user.id;

    const teacher = await User.findByPk(teacherId, {
      attributes: ['id', 'role', 'status']
    });

    if (!teacher || !['teacher', 'admin'].includes(teacher.role)) {
      return res.status(400).json({ message: 'A valid teacher account is required' });
    }

    const course = await Course.create({
      teacherId,
      ...payload,
      status: 'draft',
      approvalStatus: 'pending'
    });

    await syncCourseStats(course.id);
    await logAudit({
      req,
      action: 'CREATE_COURSE',
      entityType: 'courses',
      entityId: course.id,
      newData: course.toJSON()
    });

    return res.status(201).json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Course creation failed' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You are not allowed to update this course' });
    }

    const payload = normalizeCoursePayload({ ...course.toJSON(), ...req.body });
    if (!payload.title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (payload.isPaid && (!Number.isFinite(payload.price) || payload.price <= 0)) {
      return res.status(400).json({ message: 'Paid courses require a valid price' });
    }

    const oldData = course.toJSON();
    await course.update(payload);
    await syncCourseStats(course.id);

    await logAudit({
      req,
      action: 'UPDATE_COURSE',
      entityType: 'courses',
      entityId: course.id,
      oldData,
      newData: course.toJSON()
    });

    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Course update failed' });
  }
};

exports.submitForReview = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const validation = await validateCourseForReview(course);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Course is not ready for review',
        issues: validation.issues
      });
    }

    const oldData = course.toJSON();
    await course.update({
      status: 'review',
      approvalStatus: 'pending',
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null
    });

    await logAudit({
      req,
      action: 'SUBMIT_COURSE_FOR_REVIEW',
      entityType: 'courses',
      entityId: course.id,
      oldData,
      newData: course.toJSON()
    });

    return res.json({
      message: 'Course submitted for review',
      course
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Submission failed' });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const action = String(req.body.action || req.body.status || '').toLowerCase();
    const oldData = course.toJSON();

    if (!['approve', 'approved', 'publish', 'published', 'reject', 'rejected', 'draft', 'unpublish'].includes(action)) {
      return res.status(400).json({ message: 'Invalid course action' });
    }

    if (['approve', 'approved'].includes(action)) {
      await course.update({
        approvalStatus: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: null
      });
    } else if (['publish', 'published'].includes(action)) {
      if (course.approvalStatus !== 'approved') {
        return res.status(400).json({ message: 'Course must be approved before publishing' });
      }
      await course.update({ status: 'published' });
      await publishCourseContent(course.id, true);
    } else if (['reject', 'rejected'].includes(action)) {
      await course.update({
        status: 'rejected',
        approvalStatus: 'rejected',
        rejectionReason: req.body.rejectionReason?.trim() || 'Rejected by admin'
      });
      await publishCourseContent(course.id, false);
    } else {
      await course.update({
        status: 'draft',
        approvalStatus: 'pending',
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null
      });
      await publishCourseContent(course.id, false);
    }

    await logAudit({
      req,
      action: 'UPDATE_COURSE_STATUS',
      entityType: 'courses',
      entityId: course.id,
      oldData,
      newData: course.toJSON()
    });

    return res.json({
      message: 'Course status updated',
      course
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Status update failed' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You are not allowed to delete this course' });
    }

    const oldData = course.toJSON();
    await course.destroy();

    await logAudit({
      req,
      action: 'DELETE_COURSE',
      entityType: 'courses',
      entityId: course.id,
      oldData
    });

    return res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Course deletion failed' });
  }
};
