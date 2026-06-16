const mongoose = require('mongoose');

const WeatherCacheSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  weatherData: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Ensure unique index on coordinate pairs for fast lookup and prevention of duplicates
WeatherCacheSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

module.exports = mongoose.model('WeatherCache', WeatherCacheSchema);
