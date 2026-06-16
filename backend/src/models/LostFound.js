const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['lost', 'found'], required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  contactName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, enum: ['active', 'resolved'], default: 'active', index: true }
}, { timestamps: true });

// Text Index for Search Optimization
LostFoundSchema.index({ title: 'text', description: 'text', location: 'text' });

// Compound Index
LostFoundSchema.index({ status: 1, type: 1, date: -1 });

module.exports = mongoose.model('LostFound', LostFoundSchema);
