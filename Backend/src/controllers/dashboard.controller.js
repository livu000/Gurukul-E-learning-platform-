const {
  Course,
  LessonProgress,
  AssignmentSubmission,
  Assignment,
  AssignmentGrade,
  QuizAttempt,
  Quiz
} = require('../models');

const sequelize = require('../config/db');

/**
 * GET /api/dashboard/teacher
 * Teacher Dashboard
 */
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    /* =====================================================
       1️⃣ Courses created by teacher
    ===================================================== */
    const courses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ['id', 'title'],
      raw: true
    });

    /* =====================================================
       2️⃣ Student count per course (lesson_progress proxy)
    ===================================================== */
    const studentCounts = await LessonProgress.findAll({
      attributes: [
        'course_id',
        [
          sequelize.fn(
            'COUNT',
            sequelize.fn('DISTINCT', sequelize.col('user_id'))
          ),
          'studentCount'
        ]
      ],
      include: [
        {
          model: Course,
          attributes: [],
          where: { teacher_id: teacherId }
        }
      ],
      group: ['course_id'],
      raw: true
    });

    // Map course_id → studentCount
    const studentCountMap = {};
    studentCounts.forEach(row => {
      studentCountMap[row.course_id] = Number(row.studentCount);
    });

    const coursesWithCounts = courses.map(course => ({
      courseId: course.id,
      title: course.title,
      studentCount: studentCountMap[course.id] || 0
    }));

    /* =====================================================
       3️⃣ Pending assignments to grade
       (submission exists but no grade yet)
    ===================================================== */
    const pendingAssignments = await AssignmentSubmission.count({
      include: [
        {
          model: Assignment,
          attributes: [],
          include: [
            {
              model: Course,
              attributes: [],
              where: { teacher_id: teacherId }
            }
          ]
        },
        {
          model: AssignmentGrade,
          required: false // LEFT JOIN
        }
      ],
      where: {
        '$AssignmentGrade.id$': null
      }
    });

    /* =====================================================
       4️⃣ Quiz attempt statistics
    ===================================================== */
    const quizStatsRaw = await QuizAttempt.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('QuizAttempt.id')), 'totalAttempts'],
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore']
      ],
      include: [
        {
          model: Quiz,
          attributes: [],
          include: [
            {
              model: Course,
              attributes: [],
              where: { teacher_id: teacherId }
            }
          ]
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
