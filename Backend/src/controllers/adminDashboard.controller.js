const { Course, Certificate, Enrollment, Payment, QuizAttempt, User } = require('../models');
const sequelize = require('../config/db');

exports.getAdminDashboard = async (req, res) => {
  try {
    const userStats = await User.findOne({
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'total'], [sequelize.fn('SUM', sequelize.literal("role = 'student'")), 'students'], [sequelize.fn('SUM', sequelize.literal("role = 'teacher'")), 'teachers'], [sequelize.fn('SUM', sequelize.literal("status = 'active'")), 'activeUsers']],
      raw: true
    });
    const courseStats = await Course.findOne({
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'total'], [sequelize.fn('SUM', sequelize.literal("status = 'published'")), 'published'], [sequelize.fn('SUM', sequelize.literal("status = 'review'")), 'pendingReview']],
      raw: true
    });
    const revenueTotal = await Payment.sum('amount', { where: { status: 'success' } });
    const activeStudents = await Enrollment.count({ where: { status: 'active' } });
    const recentCourses = await Course.findAll({ where: { status: 'review' }, limit: 5, include: [{ model: User, as: 'teacher', attributes: ['id', 'name'] }], order: [['updatedAt', 'DESC']] });
    return res.json({
      users: { total: Number(userStats?.total || 0), students: Number(userStats?.students || 0), teachers: Number(userStats?.teachers || 0), activeUsers: Number(userStats?.activeUsers || 0) },
      courses: { total: Number(courseStats?.total || 0), published: Number(courseStats?.published || 0), pendingReview: Number(courseStats?.pendingReview || 0) },
      activity: { activeStudents, quizAttempts: await QuizAttempt.count(), certificatesIssued: await Certificate.count() },
      revenue: { total: Number(revenueTotal || 0) },
      recentReviews: recentCourses
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    return res.status(500).json({ message: 'Failed to load admin dashboard' });
  }
};
