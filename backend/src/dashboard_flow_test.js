const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WeatherCache = require('./models/WeatherCache');
const MandiCache = require('./models/MandiCache');
const MetalRates = require('./models/MetalRates');
const FuelRates = require('./models/FuelRates');
const Announcement = require('./models/Announcement');
const User = require('./models/User');

const WeatherService = require('./services/WeatherService');
const MandiService = require('./services/MandiService');
const MetalService = require('./services/MetalService');

const dashboardController = require('./controllers/dashboardController');

const runDashboardTest = async () => {
  try {
    console.log('=== STARTING SMART VILLAGE DASHBOARD INTEGRATION TEST ===');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/7] Connected to MongoDB.');

    // 1. Test Weather Service and Cache
    console.log('[2/7] Testing WeatherService Cache and Fetching...');
    // Clean old Gonda weather caches
    await WeatherCache.deleteMany({ latitude: 27.13, longitude: 81.96 });
    
    const weather = await WeatherService.getWeatherForCoordinates(27.13, 81.96);
    console.log(` -> Weather fetched: Temp: ${weather.temperature}°C, Condition: ${weather.condition}`);
    if (typeof weather.temperature !== 'number' || !weather.condition) {
      throw new Error('Weather forecast mapping format is invalid.');
    }

    const cachedWeather = await WeatherCache.findOne({ latitude: 27.13, longitude: 81.96 });
    if (!cachedWeather) {
      throw new Error('Weather cache document was not written to MongoDB.');
    }
    console.log(' -> Weather cache verified successfully.');

    // 2. Test Mandi Service and Cache
    console.log('[3/7] Testing MandiService Rates and Cache...');
    // Seed/Refresh rates
    const mandiRefreshed = await MandiService.refreshMandiRates();
    if (!mandiRefreshed) {
      throw new Error('Mandi rates refresh failed.');
    }
    
    // Query records using controller mock
    let mandiData = null;
    const mockResMandi = {
      status: (code) => ({
        json: (data) => {
          mandiData = data;
        }
      })
    };
    const mockReqMandi = {
      query: { state: 'Uttar Pradesh', district: 'Gonda' }
    };
    await dashboardController.getMandiRates(mockReqMandi, mockResMandi);
    console.log(` -> Mandi rates query: retrieved ${mandiData?.data?.length} records.`);
    if (!mandiData || mandiData.data.length === 0) {
      throw new Error('No mandi rates retrieved from cache query.');
    }
    console.log(' -> Mandi rates caching & filtering verified successfully.');

    // 3. Test Metal Service and Cache
    console.log('[4/7] Testing MetalService Gold & Silver rates...');
    const metalsRefreshed = await MetalService.refreshMetalRates();
    if (!metalsRefreshed) {
      throw new Error('Metal rates refresh failed.');
    }
    
    let metalsData = null;
    const mockResMetals = {
      status: (code) => ({
        json: (data) => {
          metalsData = data;
        }
      })
    };
    await dashboardController.getMetalRates({}, mockResMetals);
    console.log(` -> Gold 24K: ₹${metalsData?.gold24K}/gm, Silver: ₹${metalsData?.silver}/gm`);
    if (!metalsData || !metalsData.gold24K || !metalsData.silver) {
      throw new Error('Metal rates not resolved from cache.');
    }
    console.log(' -> Metal rates caching & trends verified successfully.');

    // 4. Test Fuel Rates CRUD (Admin Managed)
    console.log('[5/7] Testing Fuel Rates Admin updates...');
    const testRates = {
      petrol: 96.50,
      diesel: 89.20,
      cng: 77.80,
      lpg: 900.00
    };
    
    let fuelUpdateStatus = null;
    let fuelUpdateData = null;
    const mockResFuelUpdate = {
      status: (code) => {
        fuelUpdateStatus = code;
        return {
          json: (data) => {
            fuelUpdateData = data;
          }
        };
      }
    };
    const mockReqFuelUpdate = {
      userData: { role: 'admin', userId: new mongoose.Types.ObjectId() },
      body: testRates,
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      headers: { 'user-agent': 'node-test' }
    };

    await dashboardController.updateFuelRates(mockReqFuelUpdate, mockResFuelUpdate);
    console.log(` -> Admin update fuel rates status: ${fuelUpdateStatus}`);
    if (fuelUpdateStatus !== 200) {
      throw new Error(`Failed to update fuel rates. Status: ${fuelUpdateStatus}`);
    }

    // Query rates back to verify persistence
    let fuelData = null;
    const mockResFuelGet = {
      status: (code) => ({
        json: (data) => {
          fuelData = data;
        }
      })
    };
    await dashboardController.getFuelRates({}, mockResFuelGet);
    console.log(` -> Fetched Petrol: ₹${fuelData.petrol}, Diesel: ₹${fuelData.diesel}`);
    if (fuelData.petrol !== testRates.petrol || fuelData.diesel !== testRates.diesel) {
      throw new Error('Persisted fuel rates mismatch.');
    }
    console.log(' -> Fuel rates admin editing & lookup verified successfully.');

    // 5. Test Announcements Lifecycle
    console.log('[6/7] Testing Announcements CRUD Lifecycle...');
    
    // Create
    let createStatus = null;
    let createdAnn = null;
    const mockResCreate = {
      status: (code) => {
        createStatus = code;
        return {
          json: (data) => {
            createdAnn = data;
          }
        };
      }
    };
    const mockReqCreate = {
      userData: { role: 'admin', userId: new mongoose.Types.ObjectId() },
      body: {
        title: 'Test Circular Gonda',
        content: 'Testing announcements model lifecycle.',
        type: 'announcement',
        village: 'Gonda'
      },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      headers: { 'user-agent': 'node-test' }
    };

    await dashboardController.createAnnouncement(mockReqCreate, mockResCreate);
    console.log(` -> Create Announcement status: ${createStatus}, Title: "${createdAnn?.title}"`);
    if (createStatus !== 201 || !createdAnn?._id) {
      throw new Error('Failed to create announcement.');
    }

    // Update
    let updateStatus = null;
    let updatedAnn = null;
    const mockResUpdate = {
      status: (code) => {
        updateStatus = code;
        return {
          json: (data) => {
            updatedAnn = data;
          }
        };
      }
    };
    const mockReqUpdate = {
      userData: { role: 'admin', userId: new mongoose.Types.ObjectId() },
      params: { id: createdAnn._id.toString() },
      body: {
        title: 'Updated Test Circular Gonda',
        isActive: true
      },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      headers: { 'user-agent': 'node-test' }
    };
    await dashboardController.updateAnnouncement(mockReqUpdate, mockResUpdate);
    console.log(` -> Update Announcement status: ${updateStatus}, New Title: "${updatedAnn?.title}"`);
    if (updateStatus !== 200 || updatedAnn?.title !== 'Updated Test Circular Gonda') {
      throw new Error('Failed to update announcement.');
    }

    // Fetch Public Listings
    let publicAnn = null;
    const mockResGetAnn = {
      status: (code) => ({
        json: (data) => {
          publicAnn = data;
        }
      })
    };
    await dashboardController.getAnnouncements({ query: { village: 'Gonda' } }, mockResGetAnn);
    console.log(` -> Retrieved ${publicAnn?.length} announcements for Gonda.`);
    const hasItem = publicAnn?.some(a => a._id.toString() === createdAnn._id.toString());
    if (!hasItem) {
      throw new Error('Created announcement not visible in public listings.');
    }

    // Delete
    let deleteStatus = null;
    const mockResDelete = {
      status: (code) => {
        deleteStatus = code;
        return {
          json: (data) => {}
        };
      }
    };
    const mockReqDelete = {
      userData: { role: 'admin', userId: new mongoose.Types.ObjectId() },
      params: { id: createdAnn._id.toString() },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      headers: { 'user-agent': 'node-test' }
    };
    await dashboardController.deleteAnnouncement(mockReqDelete, mockResDelete);
    console.log(` -> Delete Announcement status: ${deleteStatus}`);
    if (deleteStatus !== 200) {
      throw new Error('Failed to delete announcement.');
    }

    // Verify deleted
    const checkAnn = await Announcement.findById(createdAnn._id);
    if (checkAnn) {
      throw new Error('Announcement document remains in DB after delete request.');
    }
    console.log(' -> Announcements CRUD lifecycle verified successfully.');

    // 6. Database Cleanup
    console.log('[7/7] Cleaning up database test records...');
    await WeatherCache.deleteMany({ latitude: 27.13, longitude: 81.96 });
    console.log(' -> Database cleaned up.');
    console.log('=== SMART VILLAGE DASHBOARD INTEGRATION TEST PASSED ===');
    process.exit(0);
  } catch (error) {
    console.error('=== SMART VILLAGE DASHBOARD INTEGRATION TEST FAILED ===');
    console.error(error);
    process.exit(1);
  }
};

runDashboardTest();
