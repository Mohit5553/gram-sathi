const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceType: { type: String, enum: ['Tractor', 'JCB', 'Labour', 'Electrician', 'Plumber'], required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  providerName: { type: String },
  providerContact: { type: String },
  bookingDate: { type: Date, required: true, index: true },
  durationHours: { type: Number, min: 1 },
  totalAmount: { type: Number, min: 0 },
  commissionRate: { type: Number, default: 10 },
  commission: { type: Number, default: 0 },
  providerEarnings: { type: Number, default: 0 },
  address: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'rejected', 'completed', 'cancelled'], default: 'pending', index: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI Direct', 'Offline'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  notes: { type: String, trim: true },
  timeline: [{
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String }
  }],
  serviceLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  providerStartLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null
  }
}, { timestamps: true });

// Compound Indexes for fast provider/user booking lookups
BookingSchema.index({ providerId: 1, status: 1, createdAt: -1 });
BookingSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
