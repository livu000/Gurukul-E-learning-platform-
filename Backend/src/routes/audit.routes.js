const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/audit.controller');

router.get(
  '/',
  authenticate,
  authorizeRoles('admin'),
  controller.getAuditLogs
);

module.exports = router;
