const { Course, Certificate, Enrollment, Payment, QuizAttempt, User } = require('../models');
const sequelize = require('../config/db');
const { buildCsv } = require('../utils/document.util');

function toNumber(value, digits = 0) {
  const numeric = Number(value || 0);
  return digits > 0 ? Number(numeric.toFixed(digits)) : numeric;
}

async function getRevenueTrend() {
  return Payment.findAll({
    attributes: [
      [sequelize.literal("DATE_FORMAT(created_at, '%Y-%m')"), 'month'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'value']
    ],
    where: { status: 'success' },
    group: [sequelize.literal("DATE_FORMAT(created_at, '%Y-%m')")],
    order: [[sequelize.literal("DATE_FORMAT(created_at, '%Y-%m')"), 'ASC']],
    raw: true
  });
}

async function getEnrollmentTrend() {
  return Enrollment.findAll({
    attributes: [
      [sequelize.literal("DATE_FORMAT(enrolled_at, '%Y-%m')"), 'month'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'value']
    ],
    group: [sequelize.literal("DATE_FORMAT(enrolled_at, '%Y-%m')")],
    order: [[sequelize.literal("DATE_FORMAT(enrolled_at, '%Y-%m')"), 'ASC']],
    raw: true
  });
}

async function getTopCourses(limit = 8) {
  const courses = await Course.findAll({
    attributes: ['id', 'title', 'category', 'status', 'enrollCount', 'avgRating', 'price'],
    include: [{ model: User, as: 'teacher', attributes: ['id', 'name'] }],
    order: [['enrollCount', 'DESC'], ['updatedAt', 'DESC']],
    limit
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    category: course.category,
    status: course.status,
    enrollCount: toNumber(course.enrollCount),
    avgRating: toNumber(course.avgRating, 2),
    price: toNumber(course.price, 2),
    teacherName: course.teacher?.name || 'Unknown'
  }));
}

async function getRecentCompletions(limit = 10) {
  const completions = await Enrollment.findAll({
    where: { status: 'completed' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Course, as: 'course', attributes: ['id', 'title'] }
    ],
    order: [['completedAt', 'DESC']],
    limit
  });

  return completions.map((entry) => ({
    enrollmentId: entry.id,
    studentName: entry.user?.name || 'Unknown',
    studentEmail: entry.user?.email || '',
    courseTitle: entry.course?.title || `Course ${entry.courseId}`,
    completedAt: entry.completedAt,
    progressPercentage: toNumber(entry.progressPercentage, 2),
    certificateIssued: Boolean(entry.certificateIssued)
  }));
}

exports.getAdminDashboard = async (req, res) => {
  try {
    const userStats = await User.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("role = 'student'")), 'students'],
        [sequelize.fn('SUM', sequelize.literal("role = 'teacher'")), 'teachers'],
        [sequelize.fn('SUM', sequelize.literal("status = 'active'")), 'activeUsers']
      ],
      raw: true
    });

    const courseStats = await Course.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("status = 'published'")), 'published'],
        [sequelize.fn('SUM', sequelize.literal("status = 'review'")), 'pendingReview']
      ],
      raw: true
    });

    const revenueTotal = await Payment.sum('amount', { where: { status: 'success' } });
    const activeStudents = await Enrollment.count({ where: { status: 'active' } });
    const recentCourses = await Course.findAll({
      where: { status: 'review' },
      limit: 5,
      include: [{ model: User, as: 'teacher', attributes: ['id', 'name'] }],
      order: [['updatedAt', 'DESC']]
    });

    return res.json({
      users: {
        total: toNumber(userStats?.total),
        students: toNumber(userStats?.students),
        teachers: toNumber(userStats?.teachers),
        activeUsers: toNumber(userStats?.activeUsers)
      },
      courses: {
        total: toNumber(courseStats?.total),
        published: toNumber(courseStats?.published),
        pendingReview: toNumber(courseStats?.pendingReview)
      },
      activity: {
        activeStudents,
        quizAttempts: await QuizAttempt.count(),
        certificatesIssued: await Certificate.count()
      },
      revenue: { total: toNumber(revenueTotal, 2) },
      recentReviews: recentCourses,
      trends: {
        revenue: (await getRevenueTrend()).map((row) => ({ month: row.month, value: toNumber(row.value, 2) })),
        enrollments: (await getEnrollmentTrend()).map((row) => ({ month: row.month, value: toNumber(row.value) }))
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    return res.status(500).json({ message: 'Failed to load admin dashboard' });
  }
};

exports.getAdminAnalytics = async (req, res) => {
  try {
    const topCourses = await getTopCourses(10);
    const recentCompletions = await getRecentCompletions(12);
    const revenueTrend = (await getRevenueTrend()).map((row) => ({ month: row.month, value: toNumber(row.value, 2) }));
    const enrollmentTrend = (await getEnrollmentTrend()).map((row) => ({ month: row.month, value: toNumber(row.value) }));

    if (req.query.format === 'csv') {
      const exportType = req.query.exportType || 'top-courses';
      let csv = '';
      let filename = 'admin-analytics.csv';

      if (exportType === 'completions') {
        csv = buildCsv(
          [
            { header: 'Enrollment ID', key: 'enrollmentId' },
            { header: 'Student', key: 'studentName' },
            { header: 'Email', key: 'studentEmail' },
            { header: 'Course', key: 'courseTitle' },
            { header: 'Completed At', key: 'completedAt' },
            { header: 'Progress %', key: 'progressPercentage' },
            { header: 'Certificate Issued', key: 'certificateIssued' }
          ],
          recentCompletions
        );
        filename = 'admin-completions.csv';
      } else if (exportType === 'revenue') {
        csv = buildCsv(
          [
            { header: 'Month', key: 'month' },
            { header: 'Revenue', key: 'value' }
          ],
          revenueTrend
        );
        filename = 'admin-revenue.csv';
      } else {
        csv = buildCsv(
          [
            { header: 'Course ID', key: 'id' },
            { header: 'Course', key: 'title' },
            { header: 'Teacher', key: 'teacherName' },
            { header: 'Category', key: 'category' },
            { header: 'Status', key: 'status' },
            { header: 'Enrollments', key: 'enrollCount' },
            { header: 'Average Rating', key: 'avgRating' },
            { header: 'Price', key: 'price' }
          ],
          topCourses
        );
        filename = 'admin-top-courses.csv';
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    return res.json({
      revenueTrend,
      enrollmentTrend,
      topCourses,
      recentCompletions
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    return res.status(500).json({ message: 'Failed to load admin analytics' });
  }
};
