const mongoose = require('mongoose');

const LocalJobSchema = new mongoose.Schema({
  role: { type: String, required: true, trim: true, index: true },
  company: { type: String, required: true, trim: true, index: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  initial: { type: String, default: '💼' },
  type: { type: String, enum: ['Full Time', 'Part Time', 'Contract Basis', 'Internship'], default: 'Full Time', index: true },
  qualification: { type: String, required: true },
  desc: { type: String, required: true },
  contactPhone: { type: String, required: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

// Text search support
LocalJobSchema.index({ role: 'text', company: 'text', desc: 'text' });
LocalJobSchema.index({ type: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('LocalJob', LocalJobSchema);

