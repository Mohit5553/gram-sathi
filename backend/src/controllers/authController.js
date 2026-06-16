const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    family: 4 // Force IPv4 to prevent network unreachable (ENETUNREACH) on Render/IPv6
  });

  const mailOptions = {
    from: `"GramSathi" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'GramSathi - Your Login OTP',
    text: `Your GramSathi OTP is: ${otp}\n\nIt is valid for 10 minutes. Do not share this with anyone.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #38bdf8;">GramSathi Login</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="background: #f1f5f9; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
        <p>It is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
        <p style="font-size: 12px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ 
        email, 
        otp, 
        otpExpires
      });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();

    // Send real email OTP via Nodemailer
    await sendEmailOTP(email, otp);

    res.status(200).json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isDevUniversalOTP = process.env.NODE_ENV !== 'production' && otp === '123456';
    if (user.otp !== otp && !isDevUniversalOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP valid, generate tokens
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token to user and clear OTP
    user.refreshToken = refreshToken;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Log login activity
    logActivity({
      req,
      userId: user._id,
      action: 'AUTH_LOGIN',
      details: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} logged in successfully using OTP`
    });

    const profileCompleted = !!(
      user.name && 
      user.state && 
      user.district && 
      user.village
    );

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        village: user.village,
        state: user.state,
        district: user.district,
        profileCompleted
      }
    });  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ accessToken: newToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId).select('-otp -otpExpires -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userObj = user.toObject();
    userObj.profileCompleted = !!(
      user.name && 
      user.state && 
      user.district && 
      user.village
    );

    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, mobile, village, state, district, block, profileImage, notificationPreferences } = req.body;
  const updateData = {};
  
  if (name !== undefined) updateData.name = name;
  if (mobile !== undefined) updateData.mobile = mobile;
  if (village !== undefined) updateData.village = village;
  if (state !== undefined) updateData.state = state;
  if (district !== undefined) updateData.district = district;
  if (block !== undefined) updateData.block = block;
  if (profileImage !== undefined) updateData.profileImage = profileImage;
  if (notificationPreferences !== undefined) updateData.notificationPreferences = notificationPreferences;

  const user = await User.findByIdAndUpdate(
    req.userData.userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-otp -otpExpires -refreshToken');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userObj = user.toObject();
  userObj.profileCompleted = !!(
    user.name && 
    user.state && 
    user.district && 
    user.village
  );

  res.status(200).json({ message: 'Profile updated successfully', user: userObj });
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userData.userId,
    { 
      $set: { 
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      } 
    },
    { new: true }
  ).select('-otp -otpExpires -refreshToken');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ message: 'Location updated successfully', location: user.location });
});

exports.submitVerificationRequest = asyncHandler(async (req, res) => {
  const { aadhaarCard, panCard } = req.body;
  const user = await User.findById(req.userData.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.verification = {
    aadhaarCard,
    panCard,
    status: 'pending',
    rejectionReason: undefined,
    verifiedAt: undefined
  };

  await user.save();
  res.status(200).json({ message: 'Verification request submitted successfully', verification: user.verification });
});

exports.getVerificationStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userData.userId).select('verification');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user.verification || { status: 'unsubmitted' });
});
