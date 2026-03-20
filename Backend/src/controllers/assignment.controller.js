const { Assignment, AssignmentSubmission, AssignmentGrade, Course, Enrollment, User } = require('../models');

exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, maxMarks } = req.body;
    if (!courseId || !title?.trim() || !maxMarks) return res.status(400).json({ message: 'courseId, title, maxMarks required' });
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    const assignment = await Assignment.create({
      courseId,
      createdBy: req.user.id,
      title: title.trim(),
      description: req.body.description || null,
      instructions: req.body.instructions || null,
      allowTextSubmission: req.body.allowTextSubmission ?? true,
      allowFileSubmission: req.body.allowFileSubmission ?? true,
      maxFileSizeMb: Number(req.body.maxFileSizeMb || 10),
      maxMarks: Number(maxMarks),
      passingMarks: Number(req.body.passingMarks || 0),
      dueDate: req.body.dueDate || null,
      lateSubmissionAllowed: Boolean(req.body.lateSubmissionAllowed),
      latePenaltyPercent: Number(req.body.latePenaltyPercent || 0),
      maxAttempts: Number(req.body.maxAttempts || 1),
      isPublished: req.body.isPublished === undefined ? true : Boolean(req.body.isPublished)
    });
    return res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create assignment' });
  }
};

exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: course.id, status: ['active', 'completed'] } });
      if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
    }
    const where = { courseId: req.params.courseId };
    if (req.user.role === 'student') where.isPublished = true;
    const assignments = await Assignment.findAll({ where, order: [['dueDate', 'ASC'], ['id', 'DESC']] });
    return res.json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load assignments' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answerText, fileUrl } = req.body;
    if (!assignmentId) return res.status(400).json({ message: 'assignmentId required' });
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const priorAttempts = await AssignmentSubmission.count({ where: { assignmentId, studentId: req.user.id } });
    if (priorAttempts >= Number(assignment.maxAttempts || 1)) return res.status(400).json({ message: 'Maximum submission attempts reached' });
    const submittedAt = new Date();
    const isLate = Boolean(assignment.dueDate && submittedAt > new Date(assignment.dueDate));
    if (isLate && !assignment.lateSubmissionAllowed) return res.status(400).json({ message: 'Assignment deadline has passed' });
    const submission = await AssignmentSubmission.create({
      assignmentId,
      studentId: req.user.id,
      attemptNumber: priorAttempts + 1,
      answerText: answerText || null,
      fileUrl: fileUrl || null,
      submittedAt,
      isLate,
      status: isLate ? 'late' : priorAttempts > 0 ? 'resubmitted' : 'submitted'
    });
    return res.status(201).json(submission);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to submit assignment' });
  }
};

exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.assignmentId, { include: [{ model: Course, as: 'course' }] });
    if (!assignment?.course) return res.status(404).json({ message: 'Assignment not found' });
    if (req.user.role === 'teacher' && Number(assignment.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: req.params.assignmentId },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }, { model: AssignmentGrade, as: 'grade' }],
      order: [['submittedAt', 'DESC']]
    });
    return res.json(submissions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load submissions' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const submissionId = Number(req.params.submissionId || req.body.submissionId);
    const marksAwarded = Number(req.body.marksAwarded);
    if (!submissionId || !Number.isFinite(marksAwarded)) return res.status(400).json({ message: 'submissionId and valid marksAwarded required' });
    const submission = await AssignmentSubmission.findByPk(submissionId, { include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }, { model: AssignmentGrade, as: 'grade' }] });
    if (!submission?.assignment?.course) return res.status(404).json({ message: 'Submission not found' });
    if (req.user.role === 'teacher' && Number(submission.assignment.course.teacherId) !== Number(req.user.id)) return res.status(403).json({ message: 'Not your course' });
    if (marksAwarded < 0 || marksAwarded > Number(submission.assignment.maxMarks)) return res.status(400).json({ message: 'marksAwarded cannot exceed assignment maxMarks' });
    let grade = submission.grade;
    if (grade) {
      await grade.update({ marksAwarded, feedback: req.body.feedback ?? grade.feedback, rubricJson: req.body.rubricJson ?? grade.rubricJson, gradedBy: req.user.id, gradedAt: grade.gradedAt || new Date(), lastUpdatedAt: new Date(), version: Number(grade.version || 1) + 1, status: 'regraded' });
    } else {
      grade = await AssignmentGrade.create({ submissionId, gradedBy: req.user.id, marksAwarded, feedback: req.body.feedback || null, rubricJson: req.body.rubricJson || null, status: 'graded', gradedAt: new Date(), lastUpdatedAt: new Date() });
    }
    await submission.update({ marksAwarded, gradedAt: new Date(), status: 'graded' });
    return res.status(201).json(grade);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to grade submission' });
  }
};
