const { v4: uuidv4 } = require("uuid");
const {
  Certificate,
  Lesson,
  Module,
  LessonProgress
} = require("../models");


// ===============================
// ISSUE CERTIFICATE
// ===============================
exports.issueCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    // 1️⃣ Get all lessons of this course
    const lessons = await Lesson.findAll({
      include: {
        model: Module,
        where: { course_id: courseId }
      }
    });

    const totalLessons = lessons.length;

    // 2️⃣ Count completed lessons
    const completedLessons = await LessonProgress.count({
      where: {
        user_id: userId,
        completed: true,
        lesson_id: lessons.map(l => l.id)
      }
    });

    // 3️⃣ Check completion
    if (totalLessons === 0 || completedLessons !== totalLessons) {
      return res.status(400).json({
        message: "Course not fully completed"
      });
    }

    // 4️⃣ Check existing certificate
    const existing = await Certificate.findOne({
      where: { user_id: userId, course_id: courseId }
    });

    if (existing) {
      return res.json(existing);
    }

    // 5️⃣ Create new certificate
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


// ===============================
// GET MY CERTIFICATES
// ===============================
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.findAll({
      where: { user_id: req.user.id }
    });

    res.json(certs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// VERIFY CERTIFICATE (PUBLIC)
// ===============================
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      where: { certificate_id: req.params.certificateId }
    });

    if (!cert) {
      return res.status(404).json({
        message: "Invalid certificate"
      });
    }

    res.json(cert);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
