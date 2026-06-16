const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const CMSContent = require('./models/CMSContent');
const ActivityLog = require('./models/ActivityLog');
const cmsController = require('./controllers/cmsController');
const adminController = require('./controllers/adminController');

const runTest = async () => {
  try {
    console.log('=== STARTING ACTIVITY LOG SYSTEM INTEGRATION TEST ===');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/5] Connected to MongoDB successfully.');

    // Ensure test admin user exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log(' -> Creating temporary test admin user...');
      adminUser = new User({
        name: 'Test Activity Admin',
        email: 'activity-admin@example.com',
        role: 'admin',
        status: 'active'
      });
      await adminUser.save();
    }
    console.log(`[2/5] Using Admin user: ${adminUser.name} (${adminUser.email})`);

    // Clean up previous runs
    await ActivityLog.deleteMany({ userName: 'Test Activity Admin' });
    await CMSContent.deleteMany({ author: 'ACTIVITY_LOG_TEST_SUITE' });

    // --- TEST 1: LOGGING A CMS CONTENT CREATION ---
    console.log('[3/5] Simulating Admin action that triggers asynchronous logging...');

    let createCode = null;
    let createBody = null;
    
    const mockRes = {
      status: (code) => {
        createCode = code;
        return {
          json: (data) => { createBody = data; }
        };
      }
    };

    const mockReq = {
      body: {
        title: 'Activity System Active notice',
        content: 'Activity logging features have been fully implemented.',
        contentType: 'notice',
        author: 'ACTIVITY_LOG_TEST_SUITE'
      },
      userData: { userId: adminUser._id.toString(), role: 'admin' },
      headers: {
        'user-agent': 'ActivityLogTestAgent'
      },
      socket: {
        remoteAddress: '127.0.0.9'
      }
    };

    // Invoke CMS content creation (which triggers logActivity in background)
    await cmsController.createCMSContent(mockReq, mockRes);
    console.log(` -> CMS Creation response code: ${createCode}`);
    if (createCode !== 201) {
      throw new Error(`Failed to create mock CMS content. Status code: ${createCode}`);
    }

    // Since logActivity is asynchronous and runs in background, wait slightly for it to write to DB
    console.log(' -> Waiting for asynchronous log write (2 seconds)...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify activity log is written
    const logs = await ActivityLog.find({ action: 'CMS_CONTENT_CREATE' });
    console.log(` -> Found ${logs.length} logs for 'CMS_CONTENT_CREATE'`);
    if (logs.length === 0) {
      throw new Error('Verification failed: No ActivityLog document was written to the DB.');
    }

    const latestLog = logs[logs.length - 1];
    console.log(' -> Validating log fields:');
    console.log(`    - Actor Name: ${latestLog.userName} (Expected: ${adminUser.name})`);
    console.log(`    - Action: ${latestLog.action} (Expected: CMS_CONTENT_CREATE)`);
    console.log(`    - Details: ${latestLog.details}`);
    console.log(`    - IP Address: ${latestLog.ipAddress} (Expected: 127.0.0.9)`);
    console.log(`    - User Agent: ${latestLog.userAgent} (Expected: ActivityLogTestAgent)`);

    if (latestLog.userName !== adminUser.name) throw new Error('Incorrect userName written.');
    if (latestLog.ipAddress !== '127.0.0.9') throw new Error('Incorrect IP address captured.');
    if (latestLog.userAgent !== 'ActivityLogTestAgent') throw new Error('Incorrect userAgent captured.');
    console.log(' -> Metadata extraction and asynchronous log writing verified successfully.');

    // --- TEST 2: GET ACTIVITY LOGS RETRIEVAL & FILTERING ---
    console.log('[4/5] Testing Admin logs retrieval endpoint (/api/admin/activity-logs)...');

    let getLogsCode = null;
    let getLogsBody = null;

    const mockResLogs = {
      status: (code) => {
        getLogsCode = code;
        return {
          json: (data) => { getLogsBody = data; }
        };
      }
    };

    const mockReqLogs = {
      query: {
        category: 'content',
        search: 'Activity System Active'
      },
      userData: { userId: adminUser._id.toString(), role: 'admin' }
    };

    await adminController.getActivityLogs(mockReqLogs, mockResLogs);
    console.log(` -> Retrieve logs result code (Expected 200): ${getLogsCode}`);
    if (getLogsCode !== 200) {
      throw new Error(`Failed to retrieve activity logs. Code: ${getLogsCode}`);
    }

    const fetchedData = getLogsBody.data || [];
    console.log(` -> Retrieved ${fetchedData.length} records matching search/filters.`);
    if (fetchedData.length === 0) {
      throw new Error('Verification failed: Retrieval search/filter did not return logged activity.');
    }

    const matchedLog = fetchedData[0];
    if (matchedLog.action !== 'CMS_CONTENT_CREATE') {
      throw new Error('Verification failed: Returned log action type is incorrect.');
    }

    console.log(' -> Admin activity log retrieval and filtering verified successfully.');

    // --- CLEANUP ---
    console.log('[5/5] Performing cleanup...');
    await ActivityLog.deleteMany({ userName: 'Test Activity Admin' });
    await CMSContent.deleteMany({ author: 'ACTIVITY_LOG_TEST_SUITE' });
    if (adminUser.email === 'activity-admin@example.com') {
      await User.deleteOne({ _id: adminUser._id });
    }

    console.log('=== ACTIVITY LOG SYSTEM INTEGRATION TEST PASSED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('=== ACTIVITY LOG SYSTEM INTEGRATION TEST FAILED ===');
    console.error(error);
    process.exit(1);
  }
};

runTest();
