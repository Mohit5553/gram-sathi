const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  type: { type: String, enum: ['notice', 'announcement', 'public_info'], default: 'announcement', index: true },
  village: { type: String, trim: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  expiryDate: { type: Date }
}, { timestamps: true });

// Compound index for listing active announcements filtered by target village location
AnnouncementSchema.index({ isActive: 1, expiryDate: 1, village: 1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
