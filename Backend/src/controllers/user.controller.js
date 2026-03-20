const { User } = require('../models');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      name: req.body.name || user.name
    });

    res.json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      order: [['id', 'DESC']]
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextRole = req.body.role || user.role;

    if (!['admin', 'teacher', 'student'].includes(nextRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await user.update({
      name: req.body.name ?? user.name,
      email: req.body.email ?? user.email,
      role: nextRole
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};
