const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth.middleware');
const adminDashboardController = require('../controllers/adminDashboard.controller');

router.get('/admin', authenticate, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin role required.'
    });
  }

  return adminDashboardController.getAdminDashboard(req, res, next);
});

router.get('/admin/analytics', authenticate, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin role required.'
    });
  }

  return adminDashboardController.getAdminAnalytics(req, res, next);
});

module.exports = router;
