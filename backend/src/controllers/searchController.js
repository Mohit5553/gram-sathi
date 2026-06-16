const Tractor = require('../models/Tractor');
const JCB = require('../models/JCB');
const Labour = require('../models/Labour');
const Electrician = require('../models/Electrician');
const Plumber = require('../models/Plumber');
const asyncHandler = require('../utils/asyncHandler');

exports.getNearbyServices = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 20, serviceType } = req.query; // default radius 20km
  
  const coordinates = [parseFloat(longitude), parseFloat(latitude)];
  const maxDistanceInMeters = parseFloat(radius) * 1000;

  const modelMap = {
    'Tractor': Tractor,
    'JCB': JCB,
    'Labour': Labour,
    'Electrician': Electrician,
    'Plumber': Plumber
  };

  const getGeoNearPipeline = (serviceName) => [
    {
      $geoNear: {
        near: { type: 'Point', coordinates },
        distanceField: 'distance',
        maxDistance: maxDistanceInMeters,
        spherical: true,
        query: { isAvailable: true, status: 'approved' }
      }
    },
    {
      $addFields: { serviceCategory: serviceName }
    },
    {
      $project: {
        _id: 1,
        serviceCategory: 1,
        distance: 1,
        village: 1,
        rating: 1,
        ratePerHour: 1,
        dailyRate: 1,
        visitCharge: 1,
        location: 1,
        owner: 1,
        user: 1
      }
    }
  ];

  let results = [];

  if (serviceType) {
    if (!modelMap[serviceType]) {
      return res.status(400).json({ message: 'Invalid serviceType' });
    }
    results = await modelMap[serviceType].aggregate(getGeoNearPipeline(serviceType));
  } else {
    // Search all if no specific type requested
    const [tractors, jcbs, labours, electricians, plumbers] = await Promise.all([
      Tractor.aggregate(getGeoNearPipeline('Tractor')),
      JCB.aggregate(getGeoNearPipeline('JCB')),
      Labour.aggregate(getGeoNearPipeline('Labour')),
      Electrician.aggregate(getGeoNearPipeline('Electrician')),
      Plumber.aggregate(getGeoNearPipeline('Plumber'))
    ]);
    
    results = [...tractors, ...jcbs, ...labours, ...electricians, ...plumbers];
    // Sort combined results by distance
    results.sort((a, b) => a.distance - b.distance);
  }

  res.status(200).json({ count: results.length, data: results });
});
