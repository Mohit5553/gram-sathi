const mongoose = require('mongoose');

const GovernmentSchemeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  eligibility: { type: String, required: true },
  benefits: { type: String },
  applicationLink: { type: String, trim: true },
  department: { type: String, trim: true, index: true },
  deadline: { type: Date, index: true },
  status: { type: String, enum: ['active', 'expired', 'draft'], default: 'active', index: true },
  isFeatured: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// Text Index for Search Optimization
GovernmentSchemeSchema.index({ title: 'text', description: 'text' });

// Compound Index
GovernmentSchemeSchema.index({ status: 1, department: 1, deadline: 1 });

module.exports = mongoose.model('GovernmentScheme', GovernmentSchemeSchema);
