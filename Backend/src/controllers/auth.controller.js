const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { logAudit } = require('../utils/audit.util');

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function buildRefreshToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    lastLoginAt: user.lastLoginAt
  };
}

function sessionContext(req) {
  return {
    deviceInfo: req.body.deviceInfo || null,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || null
  };
}

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account is not active' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = buildAccessToken(user);
    const refreshToken = buildRefreshToken(user);

    await RefreshToken.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      ...sessionContext(req),
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS)
    });

    user.lastLoginAt = new Date();
    await user.save();

    await logAudit({
      req,
      userId: user.id,
      role: user.role,
      action: 'AUTH_LOGIN',
      entityType: 'users',
      entityId: user.id
    });

    return res.json({
      accessToken,
      refreshToken,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const stored = await RefreshToken.findOne({ where: { tokenHash: hashToken(refreshToken), userId: payload.id } });
    if (!stored || stored.revokedAt || (stored.expiresAt && stored.expiresAt < new Date())) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findByPk(payload.id);
    if (!user || user.status !== 'active') return res.status(403).json({ message: 'User is not active' });

    const nextRefreshToken = buildRefreshToken(user);
    const nextHash = hashToken(nextRefreshToken);
    await stored.update({
      revokedAt: new Date(),
      replacedByTokenHash: nextHash
    });

    await RefreshToken.create({
      userId: user.id,
      tokenHash: nextHash,
      ...sessionContext(req),
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS)
    });

    await logAudit({
      req,
      userId: user.id,
      role: user.role,
      action: 'AUTH_REFRESH',
      entityType: 'refresh_tokens',
      entityId: stored.id
    });

    return res.json({
      accessToken: buildAccessToken(user),
      refreshToken: nextRefreshToken
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(403).json({ message: 'Refresh failed' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'profileImage', 'bio', 'phone', 'lastLoginAt', 'createdAt']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Failed to load user profile' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await RefreshToken.findAll({
      where: {
        userId: req.user.id
      },
      attributes: ['id', 'deviceInfo', 'ipAddress', 'userAgent', 'createdAt', 'updatedAt', 'expiresAt', 'revokedAt'],
      order: [['createdAt', 'DESC']]
    });

    return res.json(sessions);
  } catch (err) {
    console.error('Get sessions error:', err);
    return res.status(500).json({ message: 'Failed to load sessions' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken required' });
    }

    const tokenHash = hashToken(refreshToken);
    const session = await RefreshToken.findOne({
      where: { tokenHash, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.update({ revokedAt: new Date() });

    await logAudit({
      req,
      action: 'AUTH_LOGOUT',
      entityType: 'refresh_tokens',
      entityId: session.id
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Logout failed' });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: {
          userId: req.user.id,
          revokedAt: null
        }
      }
    );

    await logAudit({
      req,
      action: 'AUTH_LOGOUT_ALL',
      entityType: 'refresh_tokens',
      newData: { userId: req.user.id }
    });

    return res.json({ message: 'All sessions revoked successfully' });
  } catch (err) {
    console.error('Logout all error:', err);
    return res.status(500).json({ message: 'Logout all failed' });
  }
};
