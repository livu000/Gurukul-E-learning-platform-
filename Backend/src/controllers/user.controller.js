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
