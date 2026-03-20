const bcrypt = require('bcrypt');
const { User } = require('../models');
const { logAudit } = require('../utils/audit.util');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    bio: user.bio,
    phone: user.phone,
    profileImage: user.profileImage,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'bio', 'phone', 'profileImage', 'lastLoginAt', 'createdAt']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

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

    await logAudit({
      req,
      action: 'USER_UPDATE_PROFILE',
      entityType: 'users',
      entityId: user.id,
      newData: req.body
    });

    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Update failed' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'student', status = 'active' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!['active', 'blocked', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      status,
      bio: req.body.bio || null,
      phone: req.body.phone || null,
      profileImage: req.body.profileImage || null
    });

    await logAudit({
      req,
      action: 'CREATE_USER',
      entityType: 'users',
      entityId: user.id,
      newData: sanitizeUser(user)
    });

    return res.status(201).json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create user' });
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
    return res.json(sanitizeUser(user));
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

    const updatePayload = {
      name: req.body.name ?? user.name,
      email: req.body.email ?? user.email,
      role: nextRole,
      status: nextStatus,
      phone: req.body.phone ?? user.phone,
      bio: req.body.bio ?? user.bio,
      profileImage: req.body.profileImage ?? user.profileImage
    };

    if (req.body.password) {
      updatePayload.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.update(updatePayload);

    await logAudit({
      req,
      action: 'UPDATE_USER',
      entityType: 'users',
      entityId: user.id,
      newData: sanitizeUser(user)
    });

    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (Number(user.id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.destroy();

    await logAudit({
      req,
      action: 'DELETE_USER',
      entityType: 'users',
      entityId: user.id,
      oldData: sanitizeUser(user)
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};
