const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth.middleware');
const adminDashboardController = require('../controllers/adminDashboard.controller');

/**
 * ADMIN DASHBOARD
 * GET /api/dashboard/admin
 */
router.get('/admin', authenticate, (req, res, next) => {
  // RBAC: Only admin allowed
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin role required.'
    });
  }

  return adminDashboardController.getAdminDashboard(req, res, next);
});

module.exports = router;
