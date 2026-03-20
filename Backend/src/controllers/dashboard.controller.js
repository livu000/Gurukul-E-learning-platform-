const {
  Course,
  LessonProgress,
  AssignmentSubmission,
  Assignment,
  AssignmentGrade,
  QuizAttempt,
  Quiz,
  Enrollment,
  Certificate,
  Module,
  Lesson,
  User
} = require('../models');

const sequelize = require('../config/db');
const { Op } = require('sequelize');

/**
 * GET /api/dashboard/teacher
 * Teacher Dashboard
 */
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    /* 
       1️ Courses created by teacher
     */
    const courses = await Course.findAll({
      where: { teacherId },
      attributes: ['id', 'title'],
      raw: true
    });

    /* 
       2️⃣ Student count per course (lesson_progress proxy)
     */
    const studentCounts = await Enrollment.findAll({
      attributes: [
        'courseId',
        [
          sequelize.fn(
            'COUNT',
            sequelize.col('Enrollment.id')
          ),
          'studentCount'
        ]
      ],
      where: { status: 'active' },
      include: [{
        model: Course,
        as: 'course',
        attributes: [],
        where: { teacherId }
      }],
      group: ['courseId'],
      raw: true
    });

    // Map course_id → studentCount
    const studentCountMap = {};
    studentCounts.forEach(row => {
      studentCountMap[row.courseId] = Number(row.studentCount);
    });

    const coursesWithCounts = courses.map(course => ({
      courseId: course.id,
      title: course.title,
      studentCount: studentCountMap[course.id] || 0
    }));

    /* 
       3️ Pending assignments to grade
       (submission exists but no grade yet)
     */
    const pendingAssignments = await AssignmentSubmission.count({
      include: [
        {
          model: Assignment,
          as: 'assignment',
          attributes: [],
          include: [{
            model: Course,
            as: 'course',
            attributes: [],
            where: { teacherId }
          }]
        },
        {
          model: AssignmentGrade,
          as: 'grade',
          required: false // LEFT JOIN
        }
      ],
      where: {
        '$grade.id$': null
      }
    });

    /* 
       4️ Quiz attempt statistics
     */
    const quizStatsRaw = await QuizAttempt.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('QuizAttempt.id')), 'totalAttempts'],
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore']
      ],
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: [],
          include: [{
            model: Course,
            as: 'course',
            attributes: [],
            where: { teacherId }
          }]
        }
      ],
      raw: true
    });

    const totalAttempts = Number(quizStatsRaw?.totalAttempts || 0);
    const averageScore = quizStatsRaw?.averageScore
      ? Math.round(quizStatsRaw.averageScore)
      : 0;

    /* =====================================================
       FINAL RESPONSE (LOCKED CONTRACT)
    ===================================================== */
    return res.json({
      courses: coursesWithCounts,
      pendingAssignments,
      quizStats: {
        totalAttempts,
        averageScore
      }
    });
  } catch (error) {
    console.error('Teacher Dashboard Error:', error);
    return res.status(500).json({
      message: 'Failed to load teacher dashboard'
    });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: {
        userId,
        status: 'active'
      },
      include: [{
        model: Course,
        as: 'course',
        include: [{
          model: User,
          as: 'teacher',
          attributes: ['id', 'name']
        }]
      }],
      order: [['enrolledAt', 'DESC'], ['id', 'DESC']]
    });

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    const enrolledCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await Lesson.count({
          include: [{
            model: Module,
            as: 'module',
            where: { courseId: enrollment.courseId }
          }]
        });

        const completedLessons = await LessonProgress.count({
          where: {
            userId,
            courseId: enrollment.courseId,
            status: 'completed'
          }
        });

        const progressPercentage = totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

        return {
          id: enrollment.course?.id,
          title: enrollment.course?.title,
          instructor: enrollment.course?.teacher?.name || 'Unknown',
          progressPercentage,
          totalLessons,
          completedLessons
        };
      })
    );

    let pendingAssignments = [];
    let quizHistory = [];

    if (courseIds.length > 0) {
      const assignments = await Assignment.findAll({
        where: { courseId: courseIds },
        order: [['dueDate', 'ASC'], ['id', 'DESC']]
      });

      const submissions = await AssignmentSubmission.findAll({
        where: {
          studentId: userId,
          assignmentId: assignments.map((assignment) => assignment.id)
        },
        attributes: ['assignmentId'],
        raw: true
      });

      const submittedAssignmentIds = new Set(
        submissions.map((submission) => submission.assignmentId)
      );

      pendingAssignments = assignments
        .filter((assignment) => !submittedAssignmentIds.has(assignment.id))
        .map((assignment) => ({
          id: assignment.id,
          courseId: assignment.courseId,
          title: assignment.title,
          dueDate: assignment.dueDate
        }));

      const attempts = await QuizAttempt.findAll({
        where: { studentId: userId },
        include: [{
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'courseId']
        }],
        order: [['startedAt', 'DESC'], ['id', 'DESC']]
      });

      quizHistory = attempts.map((attempt) => ({
        id: attempt.id,
        quizId: attempt.quizId,
        title: attempt.quiz?.title || 'Quiz',
        courseId: attempt.quiz?.courseId,
        score: attempt.score,
        submittedAt: attempt.submittedAt
      }));
    }

    const certificates = await Certificate.findAll({
      where: { user_id: userId },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }],
      order: [['issued_at', 'DESC']]
    });

    const lessonsCompleted = await LessonProgress.count({
      where: {
        userId,
        status: 'completed',
        completedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    return res.json({
      enrolledCourses,
      pendingAssignments,
      quizHistory,
      certificates,
      weeklyProgress: {
        lessonsCompleted
      }
    });
  } catch (error) {
    console.error('Student Dashboard Error:', error);
    return res.status(500).json({
      message: 'Failed to load student dashboard'
    });
  }
};
