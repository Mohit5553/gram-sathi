const mongoose = require('mongoose');

const TractorSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tractorType: { type: String, required: [true, 'Tractor type is required'], trim: true },
  brand: { type: String, trim: true },
  ratePerHour: { type: Number, required: [true, 'Rate per hour is required'], min: [0, 'Rate cannot be negative'] },
  village: { type: String, required: true, index: true, trim: true },
  block: { type: String, trim: true, index: true },
  district: { type: String, trim: true, index: true },
  state: { type: String, trim: true, index: true },
  images: [{ type: String }],
  isAvailable: { type: Boolean, default: true, index: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  availability: {
    vacationMode: { type: Boolean, default: false },
    daily: {
      startHour: { type: String, default: "08:00" },
      endHour: { type: String, default: "18:00" }
    },
    weekly: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true }
    },
    blockedDates: [{ type: String }]
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

// Compound Index for Advanced Search Optimization (Equality -> Sort -> Range)
TractorSchema.index({ status: 1, isAvailable: 1, state: 1, district: 1, block: 1, village: 1, ratePerHour: 1, rating: -1 });
TractorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Tractor', TractorSchema);
