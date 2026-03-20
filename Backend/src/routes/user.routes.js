const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { preventRoleEscalation } = require('../middleware/roleGuard.middleware');
const controller = require('../controllers/user.controller');

router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, preventRoleEscalation, controller.updateProfile);
router.post('/', authenticate, authorizeRoles('admin'), controller.createUser);
router.get('/', authenticate, authorizeRoles('admin'), controller.getAllUsers);
router.get('/:id', authenticate, authorizeRoles('admin'), controller.getUserById);
router.patch('/:id', authenticate, authorizeRoles('admin'), controller.updateUser);
router.delete('/:id', authenticate, authorizeRoles('admin'), controller.deleteUser);

module.exports = router;
