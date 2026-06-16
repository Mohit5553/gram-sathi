const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.post('/booking/:bookingId/review',
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('providerRating').isInt({ min: 1, max: 5 }).withMessage('Provider rating must be between 1 and 5'),
  body('serviceRating').isInt({ min: 1, max: 5 }).withMessage('Service rating must be between 1 and 5'),
  body('reviewText')
    .notEmpty().withMessage('Review description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Review text must be between 10 and 500 characters')
    .trim().escape(),
  validateRequest,
  reviewController.createReview
);

router.get('/booking/:bookingId/review', auth, reviewController.getBookingReview);
router.get('/provider/:providerId/reviews', reviewController.getProviderReviews);
router.get('/service/:serviceId/reviews', reviewController.getServiceReviews);

module.exports = router;
