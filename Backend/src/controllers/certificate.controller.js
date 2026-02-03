const { v4: uuidv4 } = require("uuid");
const { Certificate, Lesson, Module, LessonProgress } = require("../models");

// ISSUE CERTIFICATE
const issueCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const lessons = await Lesson.findAll({
      include: {
        model: Module,
        where: { course_id: courseId }
      }
    });

    const totalLessons = lessons.length;

    const completedLessons = await LessonProgress.count({
      where: {
        user_id: userId,
        status: "completed",
        lesson_id: lessons.map(l => l.id)
      }
    });

    if (totalLessons === 0 || completedLessons !== totalLessons) {
      return res.status(400).json({ message: "Course not fully completed" });
    }

    const existing = await Certificate.findOne({
      where: { user_id: userId, course_id: courseId }
    });

    if (existing) return res.json(existing);

    const cert = await Certificate.create({
      certificate_id: uuidv4().replace(/-/g, "").slice(0, 20),
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
  const certs = await Certificate.findAll({
    where: { user_id: req.user.id }
  });
  res.json(certs);
};

// VERIFY CERTIFICATE
const verifyCertificate = async (req, res) => {
  const cert = await Certificate.findOne({
    where: { certificate_id: req.params.certificateId }
  });

  if (!cert) {
    return res.status(404).json({ message: "Invalid certificate" });
  }

  res.json(cert);
};

module.exports = {
  issueCertificate,
  getMyCertificates,
  verifyCertificate
};
