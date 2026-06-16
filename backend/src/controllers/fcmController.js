const User = require('../models/User');

exports.registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findById(req.userData.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.status(200).json({ message: 'FCM Token registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findById(req.userData.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fcmTokens = user.fcmTokens.filter(t => t !== token);
    await user.save();

    res.status(200).json({ message: 'FCM Token removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
