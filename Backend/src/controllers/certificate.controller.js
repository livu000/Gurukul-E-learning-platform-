const crypto = require('crypto');
const { Certificate, Course, Enrollment, User } = require('../models');

function buildCertificatePayload(certificate) {
  return {
    id: certificate.id,
    certificateUid: certificate.certificateUid,
    verificationCode: certificate.verificationCode,
    certificateUrl: certificate.certificateUrl,
    issuedAt: certificate.issuedAt,
    isValid: certificate.isValid,
    userId: certificate.userId,
    courseId: certificate.courseId,
    enrollmentId: certificate.enrollmentId,
    userNameSnapshot: certificate.userNameSnapshot,
    courseTitleSnapshot: certificate.courseTitleSnapshot
  };
}

const issueCertificate = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId, status: 'completed' }, include: [{ model: Course, as: 'course' }, { model: User, as: 'user' }] });
    if (!enrollment?.course || !enrollment.user) return res.status(400).json({ message: 'Course not fully completed' });
    const existing = await Certificate.findOne({ where: { userId: req.user.id, courseId } });
    if (existing) return res.json(buildCertificatePayload(existing));
    const certificate = await Certificate.create({
      certificateUid: crypto.randomUUID(),
      userId: req.user.id,
      courseId,
      enrollmentId: enrollment.id,
      verificationCode: crypto.randomBytes(8).toString('hex').toUpperCase(),
      userNameSnapshot: enrollment.user.name,
      courseTitleSnapshot: enrollment.course.title,
      issuedAt: new Date()
    });
    await enrollment.update({ certificateIssued: true });
    return res.json(buildCertificatePayload(certificate));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Failed to issue certificate' });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.findAll({ where: { userId: req.user.id }, include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }], order: [['issuedAt', 'DESC']] });
    return res.json(certs.map((certificate) => ({ ...buildCertificatePayload(certificate), course: certificate.course })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load certificates' });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ where: { certificateUid: req.params.certificateId }, include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }] });
    if (!cert) return res.status(404).json({ message: 'Invalid certificate' });
    return res.json({ ...buildCertificatePayload(cert), course: cert.course, user: cert.user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to verify certificate' });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ where: { certificateUid: req.params.certificateId }, include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }] });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    const isOwner = Number(cert.userId) === Number(req.user.id);
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'You are not allowed to download this certificate' });
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Certificate ${cert.certificateUid}</title><style>body{font-family:Georgia,serif;padding:40px;background:#f5f3ef;color:#111827}.certificate{border:6px solid #111827;padding:40px;max-width:820px;margin:0 auto;background:#fffdf8}h1{font-size:40px;margin:0 0 12px}p{font-size:18px;line-height:1.7}.meta{margin-top:24px;font-size:14px;color:#4b5563}</style></head><body><div class="certificate"><h1>Certificate of Completion</h1><p>This certifies that <strong>${cert.userNameSnapshot || cert.user?.name || 'Student'}</strong> successfully completed <strong>${cert.courseTitleSnapshot || cert.course?.title || 'Course'}</strong>.</p><p>Issued on ${new Date(cert.issuedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}.</p><p class="meta">Certificate UID: ${cert.certificateUid}<br/>Verification Code: ${cert.verificationCode}</p></div></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${cert.certificateUid}.html"`);
    return res.send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to download certificate' });
  }
};

module.exports = { issueCertificate, getMyCertificates, verifyCertificate, downloadCertificate };
