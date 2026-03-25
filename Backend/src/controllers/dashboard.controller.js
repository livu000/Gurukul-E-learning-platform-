const { Op } = require('sequelize');
const {
  Assignment,
  AssignmentGrade,
  AssignmentSubmission,
  Certificate,
  Course,
  Enrollment,
  LessonProgress,
  Module,
  Lesson,
  Payment,
  Quiz,
  QuizAttempt,
  User
} = require('../models');
const sequelize = require('../config/db');

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courses = await Course.findAll({
      where: { teacherId },
      attributes: ['id', 'title', 'status', 'approvalStatus', 'enrollCount'],
      order: [['updated_at', 'DESC']]
    });

    const pendingAssignments = await AssignmentSubmission.count({
      include: [
        {
          model: Assignment,
          as: 'assignment',
          required: true,
          include: [{ model: Course, as: 'course', required: true, where: { teacherId } }]
        },
        { model: AssignmentGrade, as: 'grade', required: false }
      ],
      where: { '$grade.id$': null }
    });

    const quizStatsRaw = await QuizAttempt.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('QuizAttempt.id')), 'totalAttempts'],
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore']
      ],
      include: [{ model: Quiz, as: 'quiz',attributes:[], required: true, include: [{ model: Course, as: 'course',attributes:[], required: true, where: { teacherId } }] }],
      raw: true
    });

    const revenueTotal = await Payment.sum('amount', {
      where: { status: 'success' },
      include: [{ model: Course, as: 'course',attributes:[], required: true, where: { teacherId } }]
    });

    const recentSubmissions = await AssignmentSubmission.findAll({
      include: [
        {
          model: Assignment,
          as: 'assignment',
          required: true,
          include: [{ model: Course, as: 'course', required: true, where: { teacherId } }]
        },
        { model: User, as: 'student', attributes: ['id', 'name'] },
        { model: AssignmentGrade, as: 'grade', required: false }
      ],
      order: [['submitted_at', 'DESC']],
      limit: 5
    });

    return res.json({
      courses: courses.map((course) => ({
        courseId: course.id,
        title: course.title,
        studentCount: Number(course.enrollCount || 0),
        status: course.status,
        approvalStatus: course.approvalStatus
      })),
      pendingAssignments,
      quizStats: {
        totalAttempts: Number(quizStatsRaw?.totalAttempts || 0),
        averageScore: Math.round(Number(quizStatsRaw?.averageScore || 0))
      },
      earnings: {
        total: Number(revenueTotal || 0)
      },
      recentSubmissions: recentSubmissions.map((submission) => ({
        id: submission.id,
        assignmentTitle: submission.assignment?.title || 'Assignment',
        courseTitle: submission.assignment?.course?.title || 'Course',
        studentName: submission.student?.name || 'Unknown',
        submittedAt: submission.submittedAt,
        graded: Boolean(submission.grade)
      })),
      summary: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((course) => course.status === 'published').length,
        reviewCourses: courses.filter((course) => course.status === 'review').length
      }
    });
  } catch (error) {
    console.error('Teacher Dashboard Error:', error);
    return res.status(500).json({ message: 'Failed to load teacher dashboard' });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await Enrollment.findAll({
      where: { userId, status: { [Op.in]: ['active', 'completed'] } },
      include: [{ model: Course, as: 'course', include: [{ model: User, as: 'teacher', attributes: ['id', 'name'] }] }],
      order: [['updated_at', 'DESC']]
    });

    const enrolledCourseIds = enrollments.map((item) => item.courseId);
    const enrolledCourses = await Promise.all(
      enrollments.map(async (item) => {
        const totalLessons = await Lesson.count({ include: [{ model: Module, as: 'module', where: { courseId: item.courseId } }] });
        const completedLessons = await LessonProgress.count({ where: { userId, courseId: item.courseId, isCompleted: true } });
        return {
          id: item.course?.id,
          title: item.course?.title,
          instructor: item.course?.teacher?.name || 'Unknown',
          progressPercentage: Number(item.progressPercentage || 0),
          totalLessons,
          completedLessons,
          lastAccessedLessonId: item.lastAccessedLessonId
        };
      })
    );

    const assignments = enrolledCourseIds.length
      ? await Assignment.findAll({ where: { courseId: enrolledCourseIds, isPublished: true }, order: [['dueDate', 'ASC']] })
      : [];

    const submissions = assignments.length
      ? await AssignmentSubmission.findAll({ where: { studentId: userId, assignmentId: assignments.map((a) => a.id) }, attributes: ['assignmentId'], raw: true })
      : [];

    const submittedIds = new Set(submissions.map((entry) => entry.assignmentId));
    const pendingAssignments = assignments
      .filter((assignment) => !submittedIds.has(assignment.id))
      .map((assignment) => ({ id: assignment.id, courseId: assignment.courseId, title: assignment.title, dueDate: assignment.dueDate }));

    const quizHistory = await QuizAttempt.findAll({
      where: { studentId: userId },
      include: [{ model: Quiz, as: 'quiz', attributes: ['id', 'title', 'courseId'] }],
      order: [['updated_at', 'DESC']]
    });

    const certificates = await Certificate.findAll({
      where: { userId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
      order: [['issuedAt', 'DESC']]
    });

    const recommendedCourses = await Course.findAll({
      where: {
        status: 'published',
        id: { [Op.notIn]: enrolledCourseIds.length ? enrolledCourseIds : [0] }
      },
      limit: 4,
      order: [['updated_at', 'DESC']]
    });

    const lessonsCompleted = await LessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        completedAt: {
          [Op.gte]: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
        }
      }
    });

    const continueLearning = enrolledCourses.find((course) => course.lastAccessedLessonId) || enrolledCourses[0] || null;

    return res.json({
      enrolledCourses,
      continueLearning,
      pendingAssignments,
      quizHistory,
      certificates,
      recommendedCourses,
      weeklyProgress: { lessonsCompleted }
    });
  } catch (error) {
    console.error('Student Dashboard Error:', error);
    return res.status(500).json({ message: 'Failed to load student dashboard' });
  }
};
