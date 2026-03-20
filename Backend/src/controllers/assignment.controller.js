const { Op } = require('sequelize');
const { Assignment, AssignmentSubmission, AssignmentGrade, Course, Enrollment, User } = require('../models');
const { logAudit } = require('../utils/audit.util');
const { canManageCourse, getAssignmentContext } = require('../utils/lms.util');

exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, maxMarks } = req.body;
    if (!courseId || !title?.trim() || !maxMarks) {
      return res.status(400).json({ message: 'courseId, title and maxMarks are required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

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
      isPublished: req.body.isPublished === undefined ? false : Boolean(req.body.isPublished)
    });

    await logAudit({
      req,
      action: 'CREATE_ASSIGNMENT',
      entityType: 'assignments',
      entityId: assignment.id,
      newData: assignment.toJSON()
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

    if ((req.user.role === 'teacher' || req.user.role === 'admin') && !canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId: course.id,
          status: { [Op.in]: ['active', 'completed'] }
        }
      });
      if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const where = { courseId: req.params.courseId };
    if (req.user.role === 'student') where.isPublished = true;

    const assignments = await Assignment.findAll({
      where,
      order: [['dueDate', 'ASC'], ['id', 'DESC']]
    });

    return res.json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load assignments' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await getAssignmentContext(req.params.assignmentId);
    if (!assignment?.course) return res.status(404).json({ message: 'Assignment not found' });

    if ((req.user.role === 'teacher' || req.user.role === 'admin') && !canManageCourse(req.user, assignment.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId: assignment.courseId,
          status: { [Op.in]: ['active', 'completed'] }
        }
      });
      if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
      if (!assignment.isPublished) return res.status(403).json({ message: 'Assignment is not published' });
    }

    return res.json(assignment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load assignment' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await getAssignmentContext(req.params.assignmentId);
    if (!assignment?.course) return res.status(404).json({ message: 'Assignment not found' });
    if (!canManageCourse(req.user, assignment.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = assignment.toJSON();
    await assignment.update({
      title: req.body.title?.trim() || assignment.title,
      description: req.body.description ?? assignment.description,
      instructions: req.body.instructions ?? assignment.instructions,
      allowTextSubmission: req.body.allowTextSubmission ?? assignment.allowTextSubmission,
      allowFileSubmission: req.body.allowFileSubmission ?? assignment.allowFileSubmission,
      maxFileSizeMb: req.body.maxFileSizeMb ?? assignment.maxFileSizeMb,
      maxMarks: req.body.maxMarks ?? assignment.maxMarks,
      passingMarks: req.body.passingMarks ?? assignment.passingMarks,
      dueDate: req.body.dueDate ?? assignment.dueDate,
      lateSubmissionAllowed: req.body.lateSubmissionAllowed ?? assignment.lateSubmissionAllowed,
      latePenaltyPercent: req.body.latePenaltyPercent ?? assignment.latePenaltyPercent,
      maxAttempts: req.body.maxAttempts ?? assignment.maxAttempts,
      isPublished: req.body.isPublished ?? assignment.isPublished
    });

    await logAudit({
      req,
      action: 'UPDATE_ASSIGNMENT',
      entityType: 'assignments',
      entityId: assignment.id,
      oldData,
      newData: assignment.toJSON()
    });

    return res.json(assignment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update assignment' });
  }
};

exports.publishAssignment = async (req, res) => {
  try {
    const assignment = await getAssignmentContext(req.params.assignmentId);
    if (!assignment?.course) return res.status(404).json({ message: 'Assignment not found' });
    if (!canManageCourse(req.user, assignment.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = assignment.toJSON();
    await assignment.update({
      isPublished: req.body.isPublished === undefined ? true : Boolean(req.body.isPublished)
    });

    await logAudit({
      req,
      action: 'PUBLISH_ASSIGNMENT',
      entityType: 'assignments',
      entityId: assignment.id,
      oldData,
      newData: assignment.toJSON()
    });

    return res.json(assignment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update assignment publish status' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await getAssignmentContext(req.params.assignmentId);
    if (!assignment?.course) return res.status(404).json({ message: 'Assignment not found' });
    if (!canManageCourse(req.user, assignment.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const oldData = assignment.toJSON();
    await assignment.destroy();

    await logAudit({
      req,
      action: 'DELETE_ASSIGNMENT',
      entityType: 'assignments',
      entityId: assignment.id,
      oldData
    });

    return res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete assignment' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answerText, fileUrl } = req.body;
    if (!assignmentId) return res.status(400).json({ message: 'assignmentId is required' });

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (!assignment.isPublished) return res.status(403).json({ message: 'Assignment is not published' });

    if (!assignment.allowTextSubmission && answerText) {
      return res.status(400).json({ message: 'Text submission is not allowed for this assignment' });
    }

    if (!assignment.allowFileSubmission && fileUrl) {
      return res.status(400).json({ message: 'File submission is not allowed for this assignment' });
    }

    if (!String(answerText || '').trim() && !String(fileUrl || '').trim()) {
      return res.status(400).json({ message: 'Provide answerText or fileUrl' });
    }

    const priorAttempts = await AssignmentSubmission.count({
      where: { assignmentId, studentId: req.user.id }
    });

    if (priorAttempts >= Number(assignment.maxAttempts || 1)) {
      return res.status(400).json({ message: 'Maximum submission attempts reached' });
    }

    const submittedAt = new Date();
    const isLate = Boolean(assignment.dueDate && submittedAt > new Date(assignment.dueDate));
    if (isLate && !assignment.lateSubmissionAllowed) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

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

    await logAudit({
      req,
      action: 'SUBMIT_ASSIGNMENT',
      entityType: 'assignment_submissions',
      entityId: submission.id,
      newData: submission.toJSON()
    });

    return res.status(201).json(submission);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to submit assignment' });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: Assignment, as: 'assignment', attributes: ['id', 'title', 'courseId', 'maxMarks', 'passingMarks'] },
        { model: AssignmentGrade, as: 'grade' }
      ],
      order: [['submittedAt', 'DESC']]
    });

    return res.json(submissions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load submissions' });
  }
};

exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.assignmentId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!assignment?.course) return res.status(404).json({ message: 'Assignment not found' });
    if (!canManageCourse(req.user, assignment.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: req.params.assignmentId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: AssignmentGrade, as: 'grade' }
      ],
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
    const rawMarksAwarded = Number(req.body.marksAwarded);

    if (!submissionId || !Number.isFinite(rawMarksAwarded)) {
      return res.status(400).json({ message: 'submissionId and valid marksAwarded are required' });
    }

    const submission = await AssignmentSubmission.findByPk(submissionId, {
      include: [
        { model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] },
        { model: AssignmentGrade, as: 'grade' }
      ]
    });

    if (!submission?.assignment?.course) return res.status(404).json({ message: 'Submission not found' });
    if (!canManageCourse(req.user, submission.assignment.course)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (rawMarksAwarded < 0 || rawMarksAwarded > Number(submission.assignment.maxMarks)) {
      return res.status(400).json({ message: 'marksAwarded cannot exceed assignment maxMarks' });
    }

    const latePenalty = submission.isLate
      ? Number(submission.assignment.latePenaltyPercent || 0)
      : 0;
    const finalMarksAwarded = latePenalty
      ? Number((rawMarksAwarded * (1 - latePenalty / 100)).toFixed(2))
      : rawMarksAwarded;

    let grade = submission.grade;
    if (grade) {
      await grade.update({
        marksAwarded: finalMarksAwarded,
        feedback: req.body.feedback ?? grade.feedback,
        rubricJson: req.body.rubricJson ?? grade.rubricJson,
        gradedBy: req.user.id,
        gradedAt: grade.gradedAt || new Date(),
        lastUpdatedAt: new Date(),
        version: Number(grade.version || 1) + 1,
        status: 'regraded'
      });
    } else {
      grade = await AssignmentGrade.create({
        submissionId,
        gradedBy: req.user.id,
        marksAwarded: finalMarksAwarded,
        feedback: req.body.feedback || null,
        rubricJson: req.body.rubricJson || null,
        status: 'graded',
        gradedAt: new Date(),
        lastUpdatedAt: new Date()
      });
    }

    await submission.update({
      marksAwarded: finalMarksAwarded,
      gradedAt: new Date(),
      status: 'graded'
    });

    await logAudit({
      req,
      action: 'GRADE_ASSIGNMENT_SUBMISSION',
      entityType: 'assignment_grades',
      entityId: grade.id,
      newData: grade.toJSON()
    });

    return res.status(201).json({
      ...grade.toJSON(),
      rawMarksAwarded,
      latePenaltyPercent: latePenalty
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to grade submission' });
  }
};
