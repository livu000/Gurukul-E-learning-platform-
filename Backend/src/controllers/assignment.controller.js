const {
  Assignment,
  AssignmentSubmission,
  AssignmentGrade
} = require('../models');

/**
 * =========================
 * TEACHER — CREATE ASSIGNMENT
 * =========================
 */
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, maxMarks, dueDate } = req.body;

    if (!courseId || !title || !maxMarks) {
      return res.status(400).json({ message: 'courseId, title, maxMarks required' });
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      maxMarks,
      dueDate,
      createdBy: req.user.id
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
};

/**
 * =========================
 * STUDENT — VIEW ASSIGNMENTS
 * =========================
 */
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: { courseId: req.params.courseId },
      order: [['created_at', 'DESC']]
    });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load assignments' });
  }
};

/**
 * =========================
 * STUDENT — SUBMIT ASSIGNMENT
 * =========================
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answerText, fileUrl } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'assignmentId required' });
    }

    // prevent multiple submissions
    const existing = await AssignmentSubmission.findOne({
      where: {
        assignmentId,
        studentId: req.user.id
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const submission = await AssignmentSubmission.create({
      assignmentId,
      studentId: req.user.id,
      answerText,
      fileUrl
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit assignment' });
  }
};

/**
 * =========================
 * TEACHER — VIEW SUBMISSIONS
 * =========================
 */
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: req.params.assignmentId },
      order: [['submitted_at', 'DESC']]
    });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load submissions' });
  }
};

/**
 * =========================
 * TEACHER — GRADE SUBMISSION
 * =========================
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId, marksAwarded, feedback } = req.body;

    if (!submissionId || marksAwarded === undefined) {
      return res.status(400).json({ message: 'submissionId and marksAwarded required' });
    }

    const grade = await AssignmentGrade.create({
      submissionId,
      marksAwarded,
      feedback,
      gradedBy: req.user.id
    });

    res.status(201).json(grade);
  } catch (err) {
    res.status(500).json({ message: 'Failed to grade submission' });
  }
};
