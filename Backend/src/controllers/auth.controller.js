const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');


// ==========================================
// LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password required'
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3️⃣ Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ======================================
    // ACCESS TOKEN (SHORT LIFE)
    // ======================================
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // ======================================
    // REFRESH TOKEN (LONG LIFE)
    // ======================================
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token in DB
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // ======================================
    // RESPONSE
    // ======================================
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};


// ==========================================
// REFRESH TOKEN
// ==========================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'No refresh token'
      });
    }

    // Check DB
    const stored = await RefreshToken.findOne({
      where: { token: refreshToken }
    });

    if (!stored) {
      return res.status(403).json({
        message: 'Invalid refresh token'
      });
    }

    if (stored.expiresAt && stored.expiresAt < new Date()) {
      return res.status(403).json({
        message: 'Refresh token expired'
      });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    if (Number(payload.id) !== Number(stored.userId)) {
      return res.status(403).json({
        message: 'Refresh token mismatch'
      });
    }

    const user = await User.findByPk(stored.userId);

    if (!user) {
      return res.status(403).json({
        message: 'User no longer exists'
      });
    }

    // Create NEW access token
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({
      message: 'Refresh failed'
    });
  }
};
