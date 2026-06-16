const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  serviceType: {
    type: String,
    enum: ['Tractor', 'JCB', 'Labour', 'Electrician', 'Plumber'],
    required: true,
    index: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Overall star rating is required'],
    min: 1,
    max: 5
  },
  providerRating: {
    type: Number,
    required: [true, 'Provider rating is required'],
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    required: [true, 'Service rating is required'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Written review is required'],
    trim: true,
    minlength: [10, 'Review text must be at least 10 characters'],
    maxlength: [500, 'Review text cannot exceed 500 characters']
  }
}, { timestamps: true });

// Compound indexes for optimization
ReviewSchema.index({ provider: 1, rating: -1 });
ReviewSchema.index({ serviceId: 1, rating: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
