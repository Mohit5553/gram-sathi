const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Police', 'Ambulance', 'Fire', 'Electricity', 'Panchayat', 'Hospital', 'Other'], required: true, index: true },
  number: { type: String, required: true, trim: true },
  village: { type: String, trim: true, index: true },
  district: { type: String, trim: true, index: true },
  address: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Compound Index
EmergencyContactSchema.index({ category: 1, village: 1, status: 1 });

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
