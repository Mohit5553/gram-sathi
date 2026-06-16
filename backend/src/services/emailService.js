const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Sends a One-Time Password (OTP) to the specified email.
 * Tries HTTP-based Resend API first, then SendGrid API (both bypass Render SMTP blocks),
 * and finally falls back to standard SMTP if credentials are provided.
 */
const sendEmailOTP = async (email, otp) => {
  const subject = 'Your GramSathi Login OTP';
  const text = `Your OTP for login is: ${otp}. It is valid for 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #38bdf8;">GramSathi Login</h2>
      <p>Your One-Time Password (OTP) for login is:</p>
      <h1 style="background: #f1f5f9; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
      <p>It is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
      <p style="font-size: 12px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  // 1. Try Resend API (HTTP-based, never blocked by Render)
  if (process.env.RESEND_API_KEY) {
    try {
      await axios.post('https://api.resend.com/emails', {
        from: 'GramSathi <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        text: text,
        html: html
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Email successfully sent via Resend API to: ${email}`);
      return true;
    } catch (resendError) {
      console.error('Resend API sending failed, trying fallback...', resendError.response?.data || resendError.message);
    }
  }

  // 2. Try SendGrid API (HTTP-based, never blocked by Render)
  if (process.env.SENDGRID_API_KEY) {
    try {
      await axios.post('https://api.sendgrid.com/v3/mail/send', {
        personalizations: [{ to: [{ email }] }],
        from: { email: process.env.EMAIL_USER || 'onboarding@resend.dev' },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Email successfully sent via SendGrid API to: ${email}`);
      return true;
    } catch (sgError) {
      console.error('SendGrid API sending failed, trying fallback...', sgError.response?.data || sgError.message);
    }
  }

  // 3. Fallback to standard Nodemailer SMTP (works locally)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      family: 4 // Force IPv4
    });

    const mailOptions = {
      from: `"GramSathi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: text,
      html: html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent via SMTP to: ${email}`);
    return true;
  }

  throw new Error('No SMTP credentials or API keys (Resend/SendGrid) configured.');
};

module.exports = { sendEmailOTP };
