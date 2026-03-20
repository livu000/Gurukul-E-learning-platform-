const {
  Assignment,
  AssignmentSubmission,
  AssignmentGrade,
  Course,
  Enrollment,
  User
} = require('../models');

/**
 * TEACHER — CREATE ASSIGNMENT
 */
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, maxMarks, dueDate } = req.body;

    if (!courseId || !title || !maxMarks) {
      return res.status(400).json({ message: 'courseId, title, maxMarks required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not your course' });
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
 * STUDENT / TEACHER — VIEW ASSIGNMENTS
 */
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'teacher' && Number(course.teacherId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: {
          userId: req.user.id,
          courseId: course.id,
          status: 'active'
        }
      });

      if (!enrollment) {
        return res.status(403).json({ message: 'You are not enrolled in this course' });
      }
    }

    const assignments = await Assignment.findAll({
      where: { courseId: req.params.courseId },
      order: [['id', 'DESC']]
    });

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load assignments' });
  }
};

/**
 * STUDENT — SUBMIT ASSIGNMENT
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answerText, fileUrl } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'assignmentId required' });
    }

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

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
      fileUrl,
      submittedAt: new Date()
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit assignment' });
  }
};

/**
 * TEACHER — VIEW SUBMISSIONS
 */
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.assignmentId, {
      include: [{
        model: Course,
        as: 'course'
      }]
    });

    if (!assignment || !assignment.course) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && Number(assignment.course.teacherId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: req.params.assignmentId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: AssignmentGrade,
          as: 'grade'
        }
      ],
      order: [['submittedAt', 'DESC'], ['id', 'DESC']]
    });

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load submissions' });
  }
};

/**
 * TEACHER — GRADE SUBMISSION
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const submissionId = Number(req.params.submissionId || req.body.submissionId);
    const { marksAwarded, feedback } = req.body;

    if (!submissionId || marksAwarded === undefined) {
      return res.status(400).json({ message: 'submissionId and marksAwarded required' });
    }

    const submission = await AssignmentSubmission.findByPk(submissionId, {
      include: [
        {
          model: Assignment,
          as: 'assignment',
          include: [{
            model: Course,
            as: 'course'
          }]
        },
        {
          model: AssignmentGrade,
          as: 'grade'
        }
      ]
    });

    if (!submission || !submission.assignment || !submission.assignment.course) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (
      req.user.role === 'teacher' &&
      Number(submission.assignment.course.teacherId) !== Number(req.user.id)
    ) {
      return res.status(403).json({ message: 'Not your course' });
    }

    const normalizedMarks = Number(marksAwarded);

    if (!Number.isFinite(normalizedMarks) || normalizedMarks < 0) {
      return res.status(400).json({ message: 'marksAwarded must be a valid non-negative number' });
    }

    if (normalizedMarks > submission.assignment.maxMarks) {
      return res.status(400).json({ message: 'marksAwarded cannot exceed assignment maxMarks' });
    }

    let grade;

    if (submission.grade) {
      await submission.grade.update({
        marksAwarded: normalizedMarks,
        feedback,
        gradedBy: req.user.id,
        gradedAt: new Date()
      });

      grade = submission.grade;
    } else {
      grade = await AssignmentGrade.create({
        submissionId,
        marksAwarded: normalizedMarks,
        feedback,
        gradedBy: req.user.id,
        gradedAt: new Date()
      });
    }

    res.status(201).json(grade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to grade submission' });
  }
};
