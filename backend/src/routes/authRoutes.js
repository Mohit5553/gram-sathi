const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes per IP
  message: { message: 'Too many OTP requests from this IP, please try again after 15 minutes' },
  skip: (req, res) => process.env.NODE_ENV !== 'production'
});

router.post('/send-otp', 
  otpLimiter, 
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  validateRequest,
  authController.sendOtp
);

router.post('/verify-otp', 
  otpLimiter, 
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validateRequest,
  authController.verifyOtp
);

router.post('/refresh-token', 
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validateRequest,
  authController.refreshToken
);

router.get('/profile', auth, authController.getProfile);

router.post('/verify-request',
  auth,
  body('aadhaarCard').notEmpty().withMessage('Aadhaar Card document is required'),
  validateRequest,
  authController.submitVerificationRequest
);

router.get('/verification-status',
  auth,
  authController.getVerificationStatus
);

router.put('/profile', 
  auth, 
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters').trim().escape(),
  body('mobile').optional().isMobilePhone('en-IN').withMessage('Invalid mobile number'),
  body('village').optional().trim().escape(),
  body('state').optional().trim().escape(),
  body('district').optional().trim().escape(),
  validateRequest,
  authController.updateProfile
);

router.put('/location',
  auth,
  body('longitude').isNumeric(),
  body('latitude').isNumeric(),
  validateRequest,
  authController.updateLocation
);

module.exports = router;
