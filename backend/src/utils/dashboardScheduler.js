const cron = require('node-cron');
const WeatherService = require('../services/WeatherService');
const MandiService = require('../services/MandiService');
const MetalService = require('../services/MetalService');
const CurrencyService = require('../services/CurrencyService');
const NewsService = require('../services/NewsService');
const FuelRates = require('../models/FuelRates');
const MetalRates = require('../models/MetalRates');
const CurrencyRate = require('../models/CurrencyRate');
const MandiCache = require('../models/MandiCache');
const WeatherCache = require('../models/WeatherCache');
const Announcement = require('../models/Announcement');
const CMSContent = require('../models/CMSContent');

// Initial seeder to populate cached collections on server boot if empty
const seedInitialDashboardCache = async () => {
  try {
    console.log('[DashboardScheduler] Running initial dashboard cache checks...');

    // 1. Seed Fuel Rates
    const fuelCount = await FuelRates.countDocuments();
    if (fuelCount === 0) {
      console.log('[DashboardScheduler] Seeding default fuel rates for Gonda, UP...');
      const defaultFuel = new FuelRates({
        petrol: 95.12,
        diesel: 88.54,
        cng: 76.90,
        lpg: 895.00,
        district: 'Gonda',
        state: 'Uttar Pradesh'
      });
      await defaultFuel.save();
    }

    // 2. Seed Metal Rates
    const metalCount = await MetalRates.countDocuments();
    if (metalCount === 0) {
      console.log('[DashboardScheduler] Seeding initial metal rates...');
      await MetalService.refreshMetalRates();
    }

    // Seed Currency Rates
    const currencyCount = await CurrencyRate.countDocuments();
    if (currencyCount === 0) {
      console.log('[DashboardScheduler] Seeding initial currency rates...');
      await CurrencyService.refreshCurrencyRates();
    }

    // 3. Seed Mandi Rates
    const mandiCount = await MandiCache.countDocuments();
    if (mandiCount === 0) {
      console.log('[DashboardScheduler] Seeding initial Mandi rates...');
      await MandiService.refreshMandiRates();
    }

    // 4. Seed Weather forecast for Gonda, UP coordinates
    const weatherCount = await WeatherCache.countDocuments({ latitude: 27.13, longitude: 81.96 });
    if (weatherCount === 0) {
      console.log('[DashboardScheduler] Seeding initial Weather cache for Gonda...');
      await WeatherService.getWeatherForCoordinates(27.13, 81.96);
    }

    // 5. Seed default announcements if none exist
    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      console.log('[DashboardScheduler] Seeding default announcements...');
      const announcements = [
        {
          title: 'PM Kisan Samman Nidhi Update',
          content: 'The 17th installment of PM Kisan Nidhi has been released. Eligible farmers can check status in the schemes portal.',
          type: 'announcement',
          village: 'Gonda'
        },
        {
          title: 'Free Agriculture Training Camp',
          content: 'Panchayat is organizing a 3-day organic farming training camp at Panchayat Bhawan starting this Friday.',
          type: 'notice',
          village: 'Gonda'
        }
      ];
      await Announcement.insertMany(announcements);
    }

    // 6. Seed News cache
    const newsCount = await CMSContent.countDocuments({ contentType: 'news' });
    if (newsCount === 0) {
      console.log('[DashboardScheduler] Seeding initial news feed...');
      await NewsService.refreshNews();
    }

    console.log('[DashboardScheduler] Initial dashboard cache verification complete.');
  } catch (error) {
    console.error('[DashboardScheduler] Error seeding dashboard cache:', error.message);
  }
};

exports.initDashboardSchedulers = () => {
  // Run check and seeding instantly
  seedInitialDashboardCache();

  // 1. Weather Cache refresh - every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('[DashboardScheduler Cron] Running 30-min Weather cache sync...');
      // Sync weather cache for Gonda
      await WeatherService.getWeatherForCoordinates(27.13, 81.96);
    } catch (err) {
      console.error('[DashboardScheduler Cron] Weather sync failed:', err.message);
    }
  });

  // 2. Mandi Rates cache refresh - every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('[DashboardScheduler Cron] Running 6-hour Mandi rates cache sync...');
      await MandiService.refreshMandiRates();
    } catch (err) {
      console.error('[DashboardScheduler Cron] Mandi sync failed:', err.message);
    }
  });

  // 3. Metal Rates cache refresh - every 1 hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[DashboardScheduler Cron] Running 1-hour Metal rates cache sync...');
      await MetalService.refreshMetalRates();
    } catch (err) {
      console.error('[DashboardScheduler Cron] Metal sync failed:', err.message);
    }
  });

  // Currency Rates cache refresh - every 1 hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[DashboardScheduler Cron] Running 1-hour Currency rates cache sync...');
      await CurrencyService.refreshCurrencyRates();
    } catch (err) {
      console.error('[DashboardScheduler Cron] Currency sync failed:', err.message);
    }
  });

  // News cache refresh - every 1 hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[DashboardScheduler Cron] Running 1-hour News cache sync...');
      await NewsService.refreshNews();
    } catch (err) {
      console.error('[DashboardScheduler Cron] News sync failed:', err.message);
    }
  });

  console.log('[DashboardScheduler] Dashboard background cron tasks initialized successfully.');
};
