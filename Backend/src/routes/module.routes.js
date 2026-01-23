const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/module.controller');

router.post('/', authenticate, authorizeRoles('teacher', 'admin'), controller.createModule);
router.get('/course/:courseId', controller.getModulesByCourse);

module.exports = router;
