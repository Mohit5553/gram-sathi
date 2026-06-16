const MandiCache = require('../models/MandiCache');

// Mock crops list for Gonda Mandi fallback
const MOCK_CROPS = [
  { cropName: 'Gehu (Wheat)', marketName: 'Gonda Mandi', minPrice: 2350, maxPrice: 2550, modalPrice: 2450 },
  { cropName: 'Dhan (Paddy)', marketName: 'Gonda Mandi', minPrice: 2200, maxPrice: 2420, modalPrice: 2310 },
  { cropName: 'Sarso (Mustard)', marketName: 'Gonda Mandi', minPrice: 6000, maxPrice: 6400, modalPrice: 6200 },
  { cropName: 'Chana (Gram)', marketName: 'Gonda Mandi', minPrice: 4950, maxPrice: 5300, modalPrice: 5125 },
  { cropName: 'Arhar (Pigeon Pea)', marketName: 'Gonda Mandi', minPrice: 6600, maxPrice: 7000, modalPrice: 6800 },
  { cropName: 'Aloo (Potato)', marketName: 'Gonda Mandi', minPrice: 1300, maxPrice: 1600, modalPrice: 1450 },
  
  { cropName: 'Gehu (Wheat)', marketName: 'Colonelganj Mandi', minPrice: 2320, maxPrice: 2520, modalPrice: 2420 },
  { cropName: 'Dhan (Paddy)', marketName: 'Colonelganj Mandi', minPrice: 2180, maxPrice: 2380, modalPrice: 2280 },
  { cropName: 'Sarso (Mustard)', marketName: 'Colonelganj Mandi', minPrice: 5950, maxPrice: 6350, modalPrice: 6150 },
  
  { cropName: 'Gehu (Wheat)', marketName: 'Mankapur Mandi', minPrice: 2340, maxPrice: 2540, modalPrice: 2440 },
  { cropName: 'Dhan (Paddy)', marketName: 'Mankapur Mandi', minPrice: 2190, maxPrice: 2400, modalPrice: 2300 },
  { cropName: 'Sarso (Mustard)', marketName: 'Mankapur Mandi', minPrice: 5980, maxPrice: 6380, modalPrice: 6180 }
];

exports.refreshMandiRates = async () => {
  try {
    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    let records = [];

    if (apiKey) {
      console.log('[MandiService] Fetching live Mandi rates from data.gov.in API...');
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a8645436022d?api-key=${apiKey}&format=json&limit=100`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.records && data.records.length > 0) {
          records = data.records.map(rec => ({
            cropName: rec.commodity || 'Unknown Crop',
            marketName: rec.market || 'Local Mandi',
            minPrice: parseFloat(rec.min_price) || 0,
            maxPrice: parseFloat(rec.max_price) || 0,
            modalPrice: parseFloat(rec.modal_price) || 0,
            state: rec.state || 'Uttar Pradesh',
            district: rec.district || 'Gonda',
            date: rec.arrival_date ? new Date(rec.arrival_date) : new Date()
          }));
        }
      } else {
        console.warn(`[MandiService] API query failed with status ${response.status}. Using mock fallback.`);
      }
    }

    // Fallback to mock data generator if API key is absent or API returned no records
    if (records.length === 0) {
      console.log('[MandiService] Using dynamic local simulation for Mandi rates in Uttar Pradesh...');
      
      // Add slight randomized ticks to simulate a live market feel
      records = MOCK_CROPS.map(crop => {
        const tickPercent = (Math.random() * 4 - 2) / 100; // -2% to +2%
        const modalPrice = Math.round(crop.modalPrice * (1 + tickPercent));
        const minPrice = Math.round(crop.minPrice * (1 + tickPercent));
        const maxPrice = Math.round(crop.maxPrice * (1 + tickPercent));
        
        return {
          cropName: crop.cropName,
          marketName: crop.marketName,
          minPrice,
          maxPrice,
          modalPrice,
          state: 'Uttar Pradesh',
          district: 'Gonda',
          date: new Date()
        };
      });
    }

    // Clean up older records (to save database space, keep only last 3 days of rates)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await MandiCache.deleteMany({ createdAt: { $lt: threeDaysAgo } });

    // Remove today's existing records to prevent duplicates and insert new batch
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    await MandiCache.deleteMany({ createdAt: { $gte: startOfToday } });

    await MandiCache.insertMany(records);
    console.log(`[MandiService] Successfully refreshed and cached ${records.length} Mandi rates.`);
    return true;
  } catch (error) {
    console.error('[MandiService] Error refreshing Mandi rates:', error.message);
    return false;
  }
};
