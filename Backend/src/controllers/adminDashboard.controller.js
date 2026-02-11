const {
  User,
  Course,
  LessonProgress,
  QuizAttempt
} = require('../models');

const sequelize = require('../config/db');

/**
 * GET /api/dashboard/admin
 * Admin Dashboard – Platform-wide aggregation
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    /* 
       1 USER STATISTICS
       - total users
       - students count
       - teachers count
     */
    const userStats = await User.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`role = 'student'`)
          ),
          'students'
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`role = 'teacher'`)
          ),
          'teachers'
        ]
      ],
      raw: true
    });

    const users = {
      total: Number(userStats?.total || 0),
      students: Number(userStats?.students || 0),
      teachers: Number(userStats?.teachers || 0)
    };

    /* 
       2️ COURSE STATISTICS
       - total courses
       - published courses
     */
    const courseStats = await Course.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`status = 'published'`)
          ),
          'published'
        ]
      ],
      raw: true
    });

    const courses = {
      total: Number(courseStats?.total || 0),
      published: Number(courseStats?.published || 0)
    };

    /* 
       3️⃣ LEARNING ACTIVITY
       - lesson completions
       - quiz attempts
     */
    const lessonCompletions = await LessonProgress.count({
      where: { status: 'completed' }
    });

    const quizAttempts = await QuizAttempt.count();

    const activity = {
      lessonCompletions,
      quizAttempts
    };

    /* 
       4️ REVENUE (PLACEHOLDER)
       Payments not implemented yet
     */
    const revenue = {
      total: 0
    };

    /* 
       FINAL RESPONSE (LOCKED CONTRACT)
     */
    return res.json({
      users,
      courses,
      activity,
      revenue
    });

  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    return res.status(500).json({
      message: 'Failed to load admin dashboard'
    });
  }
};
