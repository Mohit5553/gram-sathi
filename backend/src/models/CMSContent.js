const mongoose = require('mongoose');

const CMSContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['banner', 'announcement', 'news', 'notice'],
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  village: {
    type: String,
    trim: true,
    index: true
  },
  author: {
    type: String,
    default: 'Admin',
    trim: true
  }
}, { timestamps: true });

// Index for compound query lookups
CMSContentSchema.index({ contentType: 1, isActive: 1, expiryDate: 1, village: 1 });

module.exports = mongoose.model('CMSContent', CMSContentSchema);
