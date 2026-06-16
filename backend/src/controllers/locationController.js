const locationHierarchy = require('../config/locations.json');
const Tractor = require('../models/Tractor');
const JCB = require('../models/JCB');
const Labour = require('../models/Labour');
const Electrician = require('../models/Electrician');
const Plumber = require('../models/Plumber');
const asyncHandler = require('../utils/asyncHandler');

// Flatten the hierarchy to make searching and suggestion fast
const flatVillages = [];
locationHierarchy.forEach(s => {
  s.districts.forEach(d => {
    d.blocks.forEach(b => {
      b.villages.forEach(v => {
        flatVillages.push({
          village: v,
          block: b.block,
          district: d.district,
          state: s.state,
          fullPath: `${v}, ${b.block}, ${d.district}, ${s.state}`
        });
      });
    });
  });
});

// GET /api/locations/hierarchy
exports.getHierarchy = asyncHandler(async (req, res) => {
  res.status(200).json(locationHierarchy);
});

// GET /api/locations/search?query=...
exports.searchLocations = asyncHandler(async (req, res) => {
  const query = req.query.query ? req.query.query.trim().toLowerCase() : '';
  if (!query) {
    return res.status(200).json([]);
  }

  const matches = flatVillages.filter(item => 
    item.village.toLowerCase().includes(query) ||
    item.block.toLowerCase().includes(query) ||
    item.district.toLowerCase().includes(query) ||
    item.state.toLowerCase().includes(query)
  );

  res.status(200).json(matches.slice(0, 10)); // return top 10 matches
});

// GET /api/locations/availability
exports.getAvailability = asyncHandler(async (req, res) => {
  const [tractors, jcbs, labours, electricians, plumbers] = await Promise.all([
    Tractor.find({ status: 'approved', isAvailable: true }),
    JCB.find({ status: 'approved', isAvailable: true }),
    Labour.find({ status: 'approved', isAvailable: true }),
    Electrician.find({ status: 'approved', isAvailable: true }),
    Plumber.find({ status: 'approved', isAvailable: true })
  ]);

  const counts = {}; // villageKey -> { Tractor: 0, JCB: 0, Labour: 0, Electrician: 0, Plumber: 0 }

  const addCount = (serviceName, doc) => {
    if (!doc.village) return;
    const key = doc.village.trim().toLowerCase();
    if (!counts[key]) {
      counts[key] = { Tractor: 0, JCB: 0, Labour: 0, Electrician: 0, Plumber: 0 };
    }
    counts[key][serviceName]++;
  };

  tractors.forEach(doc => addCount('Tractor', doc));
  jcbs.forEach(doc => addCount('JCB', doc));
  labours.forEach(doc => addCount('Labour', doc));
  electricians.forEach(doc => addCount('Electrician', doc));
  plumbers.forEach(doc => addCount('Plumber', doc));

  const results = flatVillages.map(item => {
    const key = item.village.trim().toLowerCase();
    const serviceCounts = counts[key] || { Tractor: 0, JCB: 0, Labour: 0, Electrician: 0, Plumber: 0 };
    const totalCount = Object.values(serviceCounts).reduce((a, b) => a + b, 0);
    return {
      ...item,
      services: serviceCounts,
      totalCount
    };
  });

  // Sort villages with services first
  results.sort((a, b) => b.totalCount - a.totalCount);

  res.status(200).json(results);
});
