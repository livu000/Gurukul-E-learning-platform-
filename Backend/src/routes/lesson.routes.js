const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const controller = require('../controllers/lesson.controller');

router.post('/', authenticate, authorizeRoles('teacher', 'admin'), controller.createLesson);
router.get('/module/:moduleId', controller.getLessonsByModule);

module.exports = router;
