const WeatherService = require('../services/WeatherService');
const MandiCache = require('../models/MandiCache');
const MetalRates = require('../models/MetalRates');
const CurrencyRate = require('../models/CurrencyRate');
const FuelRates = require('../models/FuelRates');
const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');

// 1. Get Weather details for coordinates
exports.getWeather = asyncHandler(async (req, res) => {
  // Default to Gonda, Uttar Pradesh coordinates if not provided
  let lat = parseFloat(req.query.lat) || 27.13;
  let lon = parseFloat(req.query.lon) || 81.96;

  const weatherData = await WeatherService.getWeatherForCoordinates(lat, lon);
  res.status(200).json(weatherData);
});

// 2. Get Mandi Rates with searching and pagination
exports.getMandiRates = asyncHandler(async (req, res) => {
  const { state, district, crop, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (state) query.state = state;
  if (district) query.district = district;
  if (crop) query.cropName = new RegExp(crop, 'i');
  
  if (search) {
    query.$or = [
      { cropName: new RegExp(search, 'i') },
      { marketName: new RegExp(search, 'i') }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1, cropName: 1 }
  };

  const skip = (options.page - 1) * options.limit;
  
  const [records, total] = await Promise.all([
    MandiCache.find(query).sort(options.sort).skip(skip).limit(options.limit),
    MandiCache.countDocuments(query)
  ]);

  res.status(200).json({
    data: records,
    pagination: {
      total,
      page: options.page,
      limit: options.limit,
      pages: Math.ceil(total / options.limit)
    }
  });
});

// 3. Get Metal Rates
exports.getMetalRates = asyncHandler(async (req, res) => {
  let rates = await MetalRates.findOne().sort({ updatedAt: -1 });
  
  if (!rates) {
    // Return mock fallback immediately if cache is empty
    rates = {
      gold24K: 9950,
      gold22K: 9125,
      silver: 109,
      gold24KChange: 0.12,
      gold22KChange: 0.08,
      silverChange: -0.05,
      updatedAt: new Date()
    };
  }
  res.status(200).json(rates);
});

// Get Currency Rates
exports.getCurrencyRates = asyncHandler(async (req, res) => {
  let rates = await CurrencyRate.findOne().sort({ updatedAt: -1 });
  
  if (!rates) {
    rates = {
      usdToInr: 83.25,
      eurToInr: 90.12,
      aedToInr: 22.66,
      usdChange: 0.12,
      eurChange: -0.18,
      aedChange: 0.05,
      updatedAt: new Date()
    };
  }
  res.status(200).json(rates);
});

// 4. Get Fuel Rates
exports.getFuelRates = asyncHandler(async (req, res) => {
  let rates = await FuelRates.findOne({ district: 'Gonda' });
  
  if (!rates) {
    // If not found, return default rates immediately
    rates = {
      petrol: 95.12,
      diesel: 88.54,
      cng: 76.90,
      lpg: 895.00,
      state: 'Uttar Pradesh',
      district: 'Gonda',
      updatedAt: new Date()
    };
  }
  res.status(200).json(rates);
});

// 5. Get Public Announcements (active and non-expired)
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const { village } = req.query;
  const query = { isActive: true };

  // Expiration check
  query.$or = [
    { expiryDate: { $exists: false } },
    { expiryDate: null },
    { expiryDate: { $gt: new Date() } }
  ];

  if (village) {
    // Return announcements targeted specifically to this village OR global broadcasts
    query.$or = [
      { village: new RegExp(village, 'i') },
      { village: { $in: [null, ''] } }
    ];
  }

  const list = await Announcement.find(query).sort({ createdAt: -1 });
  res.status(200).json(list);
});

// ==========================================
// ADMIN DASHBOARD MODULE FUNCTIONS
// ==========================================

// 6. Update Fuel Rates
exports.updateFuelRates = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can manage fuel rates' });
  }

  const { petrol, diesel, cng, lpg } = req.body;
  
  let rates = await FuelRates.findOne({ district: 'Gonda' });
  
  if (rates) {
    rates.petrol = petrol;
    rates.diesel = diesel;
    rates.cng = cng;
    rates.lpg = lpg;
    rates.updatedAt = new Date();
    await rates.save();
  } else {
    rates = new FuelRates({
      petrol,
      diesel,
      cng,
      lpg,
      district: 'Gonda',
      state: 'Uttar Pradesh'
    });
    await rates.save();
  }

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'DASHBOARD_FUEL_UPDATE',
    details: `Updated Gonda fuel rates: Petrol: ₹${petrol}, Diesel: ₹${diesel}, CNG: ₹${cng}`,
    metadata: { petrol, diesel, cng, lpg }
  });

  res.status(200).json({ message: 'Fuel rates updated successfully', data: rates });
});

// Update Metal Rates (Admin Override / Fallback)
exports.updateMetalRates = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can manage metal rates' });
  }

  const { gold24K, gold22K, silver } = req.body;
  
  let rates = await MetalRates.findOne().sort({ updatedAt: -1 });
  
  let gold24KChange = 0;
  let gold22KChange = 0;
  let silverChange = 0;
  
  if (rates) {
    gold24KChange = parseFloat((((gold24K - rates.gold24K) / rates.gold24K) * 100).toFixed(2));
    gold22KChange = parseFloat((((gold22K - rates.gold22K) / rates.gold22K) * 100).toFixed(2));
    silverChange = parseFloat((((silver - rates.silver) / rates.silver) * 100).toFixed(2));
    
    rates.gold24K = gold24K;
    rates.gold22K = gold22K;
    rates.silver = silver;
    rates.gold24KChange = gold24KChange;
    rates.gold22KChange = gold22KChange;
    rates.silverChange = silverChange;
    rates.updatedAt = new Date();
    await rates.save();
  } else {
    rates = new MetalRates({
      gold24K,
      gold22K,
      silver,
      gold24KChange,
      gold22KChange,
      silverChange,
      updatedAt: new Date()
    });
    await rates.save();
  }

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'DASHBOARD_METALS_UPDATE',
    details: `Updated Gonda metal rates: Gold 24K: ₹${gold24K}, Gold 22K: ₹${gold22K}, Silver: ₹${silver}`,
    metadata: { gold24K, gold22K, silver }
  });

  res.status(200).json({ message: 'Metal rates updated successfully', data: rates });
});

// 7. Get Announcements for Admin view (returns expired and draft items too)
exports.getAnnouncementsAdmin = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const list = await Announcement.find({}).sort({ createdAt: -1 });
  res.status(200).json(list);
});

// 8. Create Announcement
exports.createAnnouncement = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can publish announcements' });
  }

  const ann = new Announcement(req.body);
  await ann.save();

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'ANNOUNCEMENT_CREATE',
    details: `Published announcement "${ann.title}" for village: ${ann.village || 'All'}`,
    metadata: { announcementId: ann._id, title: ann.title }
  });

  res.status(201).json(ann);
});

// 9. Update Announcement
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can modify announcements' });
  }

  const ann = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!ann) return res.status(404).json({ message: 'Announcement not found' });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'ANNOUNCEMENT_UPDATE',
    details: `Modified announcement "${ann.title}"`,
    metadata: { announcementId: ann._id, title: ann.title }
  });

  res.status(200).json(ann);
});

// 10. Delete Announcement
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can delete announcements' });
  }

  const ann = await Announcement.findByIdAndDelete(req.params.id);
  if (!ann) return res.status(404).json({ message: 'Announcement not found' });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'ANNOUNCEMENT_DELETE',
    details: `Deleted announcement "${ann.title}"`,
    metadata: { title: ann.title }
  });

  res.status(200).json({ message: 'Announcement deleted successfully' });
});
