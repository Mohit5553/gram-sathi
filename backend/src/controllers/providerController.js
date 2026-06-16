const Tractor = require('../models/Tractor');
const JCB = require('../models/JCB');
const Labour = require('../models/Labour');
const Electrician = require('../models/Electrician');
const Plumber = require('../models/Plumber');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.userData.userId;

  // Fetch all services owned by user
  const [tractors, jcbs, labours, electricians, plumbers] = await Promise.all([
    Tractor.find({ owner: userId }),
    JCB.find({ owner: userId }),
    Labour.find({ user: userId }),
    Electrician.find({ user: userId }),
    Plumber.find({ user: userId })
  ]);

  // Normalize service data for the frontend
  const services = [
    ...tractors.map(t => ({ id: t._id, type: 'Tractor', name: t.tractorType, rate: t.ratePerHour, isAvailable: t.isAvailable, village: t.village, brand: t.brand, location: t.location })),
    ...jcbs.map(j => ({ id: j._id, type: 'JCB', name: 'JCB Service', rate: j.ratePerHour, isAvailable: j.isAvailable, village: j.village, location: j.location })),
    ...labours.map(l => ({ id: l._id, type: 'Labour', name: l.skillType, rate: l.dailyRate, isAvailable: l.isAvailable, village: l.village, experienceYears: l.experienceYears, location: l.location })),
    ...electricians.map(e => ({ id: e._id, type: 'Electrician', name: 'Electrician', rate: e.visitCharge, isAvailable: e.isAvailable, village: e.village, experienceYears: e.experienceYears, location: e.location, specialization: e.specialization })),
    ...plumbers.map(p => ({ id: p._id, type: 'Plumber', name: 'Plumber', rate: p.visitCharge, isAvailable: p.isAvailable, village: p.village, experienceYears: p.experienceYears, location: p.location, specialization: p.specialization }))
  ];

  const providerIds = services.map(s => s.id);

  if (providerIds.length === 0) {
    return res.status(200).json({
      stats: { earnings: 0, active: 0, pending: 0, totalJobs: 0 },
      services: []
    });
  }

  // Calculate Metrics from Bookings
  const statsAggregation = await Booking.aggregate([
    { $match: { providerId: { $in: providerIds } } },
    {
      $group: {
        _id: null,
        totalEarnings: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'completed'] }, 
              { $ifNull: ['$providerEarnings', { $multiply: ['$totalAmount', 0.9] }] }, 
              0
            ]
          }
        },
        activeCount: {
          $sum: {
            $cond: [{ $in: ['$status', ['accepted', 'in_progress']] }, 1, 0]
          }
        },
        pendingCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        totalJobs: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const stats = statsAggregation[0] || { totalEarnings: 0, activeCount: 0, pendingCount: 0, totalJobs: 0 };

  res.status(200).json({
    stats: {
      earnings: stats.totalEarnings,
      active: stats.activeCount,
      pending: stats.pendingCount,
      completedJobs: stats.totalJobs
    },
    services
  });
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { serviceType, id } = req.params;
  const { longitude, latitude } = req.body;
  const userId = req.userData.userId;

  const modelMap = {
    'tractor': Tractor,
    'jcb': JCB,
    'labour': Labour,
    'electrician': Electrician,
    'plumber': Plumber
  };

  const Model = modelMap[serviceType.toLowerCase()];
  if (!Model) {
    return res.status(400).json({ message: 'Invalid service type' });
  }

  // Ensure owner or user matches depending on the model schema
  const query = Model === Tractor || Model === JCB ? { _id: id, owner: userId } : { _id: id, user: userId };

  const service = await Model.findOneAndUpdate(
    query,
    { 
      $set: { 
        location: { type: 'Point', coordinates: [longitude, latitude] } 
      } 
    },
    { new: true }
  );

  if (!service) {
    return res.status(404).json({ message: `${serviceType} not found or unauthorized` });
  }

  res.status(200).json({ message: 'Location updated', location: service.location });
});

exports.updateAvailability = asyncHandler(async (req, res) => {
  const { serviceType, id } = req.params;
  const { vacationMode, daily, weekly, blockedDates } = req.body;
  const userId = req.userData.userId;

  const modelMap = {
    'tractor': Tractor,
    'jcb': JCB,
    'labour': Labour,
    'electrician': Electrician,
    'plumber': Plumber
  };

  const Model = modelMap[serviceType.toLowerCase()];
  if (!Model) {
    return res.status(400).json({ message: 'Invalid service type' });
  }

  const query = Model === Tractor || Model === JCB ? { _id: id, owner: userId } : { _id: id, user: userId };

  const updateFields = {};
  if (vacationMode !== undefined) updateFields['availability.vacationMode'] = vacationMode;
  if (daily) {
    if (daily.startHour !== undefined) updateFields['availability.daily.startHour'] = daily.startHour;
    if (daily.endHour !== undefined) updateFields['availability.daily.endHour'] = daily.endHour;
  }
  if (weekly) {
    Object.keys(weekly).forEach(day => {
      updateFields[`availability.weekly.${day}`] = weekly[day];
    });
  }
  if (blockedDates !== undefined) updateFields['availability.blockedDates'] = blockedDates;

  const service = await Model.findOneAndUpdate(
    query,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!service) {
    return res.status(404).json({ message: `${serviceType} not found or unauthorized` });
  }

  res.status(200).json({ message: 'Availability updated successfully', availability: service.availability });
});
