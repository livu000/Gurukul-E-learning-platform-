const { User } = require('../models');

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({
      name: req.body.name ?? user.name,
      bio: req.body.bio ?? user.bio,
      phone: req.body.phone ?? user.phone,
      profileImage: req.body.profileImage ?? user.profileImage
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      bio: user.bio,
      phone: user.phone,
      profileImage: user.profileImage
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Update failed' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.status) where.status = req.query.status;

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'status', 'phone', 'lastLoginAt', 'createdAt'],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'bio', 'phone', 'profileImage', 'lastLoginAt', 'createdAt']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const nextRole = req.body.role ?? user.role;
    const nextStatus = req.body.status ?? user.status;
    if (!['admin', 'teacher', 'student'].includes(nextRole)) return res.status(400).json({ message: 'Invalid role' });
    if (!['active', 'blocked', 'inactive'].includes(nextStatus)) return res.status(400).json({ message: 'Invalid status' });

    await user.update({
      name: req.body.name ?? user.name,
      email: req.body.email ?? user.email,
      role: nextRole,
      status: nextStatus,
      phone: req.body.phone ?? user.phone,
      bio: req.body.bio ?? user.bio,
      profileImage: req.body.profileImage ?? user.profileImage
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      lastLoginAt: user.lastLoginAt
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};
