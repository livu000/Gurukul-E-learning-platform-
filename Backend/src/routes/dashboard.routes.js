const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

/**
 * TEACHER DASHBOARD
 * GET /api/dashboard/teacher
 */
router.get('/teacher', authenticate, (req, res, next) => {
  // RBAC: Only teacher allowed
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      message: 'Access denied. Teacher role required.'
    });
  }

  return dashboardController.getTeacherDashboard(req, res, next);
});

module.exports = router;
