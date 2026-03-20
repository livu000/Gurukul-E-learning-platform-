const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');

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
      deviceInfo: req.body.deviceInfo || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS)
    });

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage
      }
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

    return res.json({ accessToken: buildAccessToken(user) });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(403).json({ message: 'Refresh failed' });
  }
};
