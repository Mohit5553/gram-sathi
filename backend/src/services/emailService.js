const nodemailer = require('nodemailer');

// Set up simple transporter using Ethereal or Gmail
// For development, we'll use a mocked console log if no credentials are provided.
const sendEmailOTP = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n================================`);
    console.log(`MOCK EMAIL SENT TO: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`================================\n`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your GramSathi Login OTP',
    text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = { sendEmailOTP };
