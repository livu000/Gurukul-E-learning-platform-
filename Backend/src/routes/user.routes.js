const router = require('express').Router();

const { authenticate } = require('../middleware/auth.middleware');
const { preventRoleEscalation } = require('../middleware/roleGuard.middleware');

const controller = require('../controllers/user.controller');

router.put(
  '/profile',
  authenticate,
  preventRoleEscalation,
  controller.updateProfile
);

module.exports = router;
