const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Tractor = require('../models/Tractor');
const JCB = require('../models/JCB');
const Labour = require('../models/Labour');
const Electrician = require('../models/Electrician');
const Plumber = require('../models/Plumber');
const asyncHandler = require('../utils/asyncHandler');

// Helper to get service model by type
const getServiceModel = (serviceType) => {
  switch (serviceType) {
    case 'Tractor': return Tractor;
    case 'JCB': return JCB;
    case 'Labour': return Labour;
    case 'Electrician': return Electrician;
    case 'Plumber': return Plumber;
    default: return null;
  }
};

exports.createReview = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { rating, providerRating, serviceRating, reviewText } = req.body;
  const userId = req.userData.userId;

  // 1. Find the booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // 2. Validate booking ownership
  if (booking.user.toString() !== userId) {
    return res.status(403).json({ message: 'Unauthorized. You can only review your own bookings.' });
  }

  // 3. Validate booking is completed
  if (booking.status !== 'completed') {
    return res.status(400).json({ message: 'Only completed bookings can be reviewed.' });
  }

  // 4. Check if already reviewed
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview || booking.review) {
    return res.status(400).json({ message: 'This booking has already been reviewed.' });
  }

  // 5. Look up provider and service details to verify owners
  const ServiceModel = getServiceModel(booking.serviceType);
  if (!ServiceModel) {
    return res.status(400).json({ message: 'Invalid service type associated with booking.' });
  }

  const service = await ServiceModel.findById(booking.providerId);
  if (!service) {
    return res.status(404).json({ message: 'Associated service provider entry not found.' });
  }

  const providerUserId = service.owner || service.user;
  if (!providerUserId) {
    return res.status(400).json({ message: 'Could not determine provider owner ID.' });
  }

  // 6. Create the review
  const review = new Review({
    booking: bookingId,
    user: userId,
    provider: providerUserId,
    serviceType: booking.serviceType,
    serviceId: booking.providerId,
    rating,
    providerRating,
    serviceRating,
    reviewText
  });

  await review.save();

  // 7. Update the Booking reference
  booking.review = review._id;
  await booking.save();

  // 8. Re-calculate and update service rating
  const serviceReviews = await Review.find({ serviceId: booking.providerId });
  const avgServiceRating = serviceReviews.length > 0
    ? serviceReviews.reduce((sum, r) => sum + r.serviceRating, 0) / serviceReviews.length
    : 0;
  
  service.rating = parseFloat(avgServiceRating.toFixed(1));
  await service.save();

  // 9. Re-calculate and update provider User rating
  const providerReviews = await Review.find({ provider: providerUserId });
  const avgProviderRating = providerReviews.length > 0
    ? providerReviews.reduce((sum, r) => sum + r.providerRating, 0) / providerReviews.length
    : 0;

  await User.findByIdAndUpdate(providerUserId, {
    providerRating: parseFloat(avgProviderRating.toFixed(1)),
    providerRatingCount: providerReviews.length
  });

  res.status(201).json({
    message: 'Review submitted successfully',
    review
  });
});

exports.getBookingReview = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const review = await Review.findOne({ booking: bookingId }).populate('user', 'name profileImage');
  res.status(200).json(review);
});

exports.getProviderReviews = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const reviews = await Review.find({ provider: providerId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });
  res.status(200).json(reviews);
});

exports.getServiceReviews = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const reviews = await Review.find({ serviceId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });
  res.status(200).json(reviews);
});
