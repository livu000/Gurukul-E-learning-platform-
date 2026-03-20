const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Certificate, Lesson, Module, LessonProgress, Course, User } = require('../models');

// ISSUE CERTIFICATE
const issueCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.findAll({
      attributes: ['id'],
      include: [{
        model: Module,
        as: 'module',
        attributes: [],
        where: { courseId }
      }]
    });

    const lessonIds = lessons.map((lesson) => lesson.id);
    const totalLessons = lessonIds.length;

    const completedLessons = await LessonProgress.count({
      where: {
        userId,
        courseId,
        status: 'completed',
        lessonId: {
          [Op.in]: lessonIds
        }
      }
    });

    if (totalLessons === 0 || completedLessons !== totalLessons) {
      return res.status(400).json({ message: 'Course not fully completed' });
    }

    const existing = await Certificate.findOne({
      where: { user_id: userId, course_id: courseId }
    });

    if (existing) return res.json(existing);

    const cert = await Certificate.create({
      certificate_id: uuidv4().replace(/-/g, '').slice(0, 20),
      user_id: userId,
      course_id: courseId,
      issued_at: new Date()
    });

    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MY CERTIFICATES
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }],
      order: [['issued_at', 'DESC']]
    });

    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load certificates' });
  }
};

// VERIFY CERTIFICATE
const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      where: { certificate_id: req.params.certificateId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!cert) {
      return res.status(404).json({ message: 'Invalid certificate' });
    }

    res.json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify certificate' });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      where: { certificate_id: req.params.certificateId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const isOwner = Number(cert.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not allowed to download this certificate' });
    }

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Certificate ${cert.certificate_id}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #1f2937; }
      .certificate { border: 4px solid #1d4ed8; padding: 32px; max-width: 760px; margin: 0 auto; }
      h1 { margin: 0 0 12px; font-size: 36px; }
      p { font-size: 18px; line-height: 1.6; }
      .meta { margin-top: 24px; font-size: 14px; color: #475569; }
    </style>
  </head>
  <body>
    <div class="certificate">
      <h1>Course Completion Certificate</h1>
      <p>This certifies that <strong>${cert.user?.name || 'Student'}</strong> has successfully completed <strong>${cert.course?.title || `Course ${cert.course_id}`}</strong>.</p>
      <p>Issued on ${new Date(cert.issued_at).toLocaleString('en-US', { dateStyle: 'long' })}.</p>
      <p class="meta">Certificate ID: ${cert.certificate_id}</p>
    </div>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${cert.certificate_id}.html"`
    );

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to download certificate' });
  }
};

module.exports = {
  issueCertificate,
  getMyCertificates,
  verifyCertificate,
  downloadCertificate
};
