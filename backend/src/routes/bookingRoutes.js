const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/', 
  auth, 
  body('providerId').isMongoId().withMessage('Valid Provider ID is required'),
  body('serviceType').isIn(['Tractor', 'JCB', 'Labour', 'Electrician', 'Plumber']).withMessage('Invalid service type'),
  body('bookingDate').isISO8601().withMessage('Valid booking date is required'),
  body('address').notEmpty().withMessage('Address is required').trim().escape(),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('paymentMethod').optional().isIn(['Cash', 'UPI Direct', 'Offline']).withMessage('Invalid payment method'),
  body('notes').optional().trim().escape(),
  validateRequest,
  bookingController.createBooking
);
router.get('/', auth, bookingController.getBookings);
router.get('/provider', auth, bookingController.getProviderBookings);
router.put('/:id/status', 
  auth, 
  body('status').isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected']).withMessage('Invalid status'),
  validateRequest,
  bookingController.updateStatus
);

module.exports = router;
