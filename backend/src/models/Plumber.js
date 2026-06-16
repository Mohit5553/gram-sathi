const mongoose = require('mongoose');

const PlumberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  specialization: { type: String, trim: true },
  visitCharge: { type: Number, required: [true, 'Visit charge is required'], min: 0 },
  village: { type: String, required: true, index: true, trim: true },
  block: { type: String, trim: true, index: true },
  district: { type: String, trim: true, index: true },
  state: { type: String, trim: true, index: true },
  experienceYears: { type: Number, min: 0, default: 0 },
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

// Compound Index for Advanced Search Optimization
PlumberSchema.index({ status: 1, isAvailable: 1, state: 1, district: 1, block: 1, village: 1, visitCharge: 1, rating: -1 });
PlumberSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Plumber', PlumberSchema);
