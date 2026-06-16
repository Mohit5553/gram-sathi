const mongoose = require('mongoose');

const LabourSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skillType: { type: String, enum: ['skilled', 'unskilled', 'semi-skilled'], required: true, index: true },
  dailyRate: { type: Number, required: [true, 'Daily rate is required'], min: 0 },
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
LabourSchema.index({ status: 1, isAvailable: 1, state: 1, district: 1, block: 1, village: 1, dailyRate: 1, rating: -1 });
LabourSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Labour', LabourSchema);
