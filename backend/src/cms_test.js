const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const CMSContent = require('./models/CMSContent');
const cmsController = require('./controllers/cmsController');

const runTest = async () => {
  try {
    console.log('=== STARTING CMS MODULE INTEGRATION TEST ===');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/5] Connected to MongoDB successfully.');

    // Fetch tester-user and ensure there is an admin user for validation
    const customerUser = await User.findOne({ email: 'tester-user@example.com' });
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!customerUser) {
      throw new Error('tester-user@example.com not found. Seed database verification failed.');
    }

    if (!adminUser) {
      // Temporary create/fallback admin for testing if none exists
      console.log(' -> No existing admin found, creating test admin user...');
      adminUser = new User({
        name: 'Test Admin',
        email: 'temp-admin@example.com',
        role: 'admin',
        status: 'active'
      });
      await adminUser.save();
    }
    console.log(`[2/5] Verification Users: Admin (${adminUser.email}), Customer (${customerUser.email})`);

    // Clean up any old CMS content from previous runs
    await CMSContent.deleteMany({ author: 'CMS_TEST_SUITE' });

    // --- TEST 1: CREATE ENDPOINT & ROLE RESTRICTION ---
    console.log('[3/5] Testing CREATE content endpoint & role validation:');
    
    // Test 1.1: Customer user attempts to create content (Should fail 403)
    let createCode = null;
    let createBody = null;
    
    const mockResCustomer = {
      status: (code) => {
        createCode = code;
        return {
          json: (msg) => { createBody = msg; }
        };
      }
    };

    const mockReqCustomer = {
      body: {
        title: 'Unauthorized Announcement',
        content: 'This should not be saved',
        contentType: 'announcement',
        author: 'CMS_TEST_SUITE'
      },
      userData: { userId: customerUser._id.toString(), role: 'user' }
    };

    await cmsController.createCMSContent(mockReqCustomer, mockResCustomer);
    console.log(` -> User creation attempt result (Expected 403): ${createCode}`);
    if (createCode !== 403) throw new Error('Security violation: Customer was allowed to write CMS content.');

    // Test 1.2: Admin user creates content (Should succeed 201)
    let adminCreateCode = null;
    let adminCreateBody = null;
    
    const mockResAdmin = {
      status: (code) => {
        adminCreateCode = code;
        return {
          json: (data) => { adminCreateBody = data; }
        };
      }
    };

    const mockReqAdmin = {
      body: {
        title: 'System Maintenance Alert',
        content: 'We will be conducting database updates on Sunday.',
        contentType: 'announcement',
        isActive: true,
        author: 'CMS_TEST_SUITE'
      },
      userData: { userId: adminUser._id.toString(), role: 'admin' }
    };

    await cmsController.createCMSContent(mockReqAdmin, mockResAdmin);
    console.log(` -> Admin creation attempt result (Expected 201): ${adminCreateCode}`);
    if (adminCreateCode !== 201 || !adminCreateBody?._id) throw new Error('Admin creation of announcement failed.');
    
    const announcementId = adminCreateBody._id;

    // Create secondary draft and expired items for filtering test
    const draftNotice = new CMSContent({
      title: 'Draft Notice',
      content: 'Under review draft content',
      contentType: 'notice',
      isActive: false,
      author: 'CMS_TEST_SUITE'
    });
    await draftNotice.save();

    const expiredNotice = new CMSContent({
      title: 'Expired Notice',
      content: 'This Notice is expired',
      contentType: 'notice',
      isActive: true,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
      author: 'CMS_TEST_SUITE'
    });
    await expiredNotice.save();

    const localizedNotice = new CMSContent({
      title: 'Localized Notice Rampur',
      content: 'Water supply shutdown in Rampur',
      contentType: 'notice',
      isActive: true,
      village: 'Rampur',
      author: 'CMS_TEST_SUITE'
    });
    await localizedNotice.save();

    console.log(' -> CMS items generated successfully.');

    // --- TEST 2: GET LIST FILTERS & VISIBILITY ---
    console.log('[4/5] Testing GET content listing and visibility rules:');

    // Test 2.1: Guest query for notices (Should filter out draft and expired items)
    let listCode = null;
    let listData = null;
    
    const mockResListGuest = {
      status: (code) => {
        listCode = code;
        return {
          json: (data) => { listData = data; }
        };
      }
    };

    const mockReqListGuest = {
      query: { type: 'notice' },
      userData: null // Guest user
    };

    await cmsController.getCMSContent(mockReqListGuest, mockResListGuest);
    console.log(` -> Guest Notices fetched (Expected 200): ${listCode}`);
    if (listCode !== 200) throw new Error('Failed to retrieve notices.');

    const noticeTitles = listData.data.map(item => item.title);
    console.log(`    Retrieved notices:`, noticeTitles);
    
    if (noticeTitles.includes('Draft Notice')) throw new Error('Visibility leak: Draft notice visible to public.');
    if (noticeTitles.includes('Expired Notice')) throw new Error('Visibility leak: Expired notice visible to public.');
    if (!noticeTitles.includes('Localized Notice Rampur')) throw new Error('Missing active notice in listing.');
    console.log(' -> Draft/Expiry filters verified successfully.');

    // Test 2.2: Localized notice filtering by village
    let listCodeRampur = null;
    let listDataRampur = null;

    const mockResListRampur = {
      status: (code) => {
        listCodeRampur = code;
        return {
          json: (data) => { listDataRampur = data; }
        };
      }
    };

    const mockReqListRampur = {
      query: { type: 'notice', village: 'Rampur' },
      userData: { userId: customerUser._id.toString(), role: 'user' }
    };

    await cmsController.getCMSContent(mockReqListRampur, mockResListRampur);
    const rampurTitles = listDataRampur.data.map(item => item.title);
    console.log(`    Retrieved notices for village Rampur:`, rampurTitles);
    if (!rampurTitles.includes('Localized Notice Rampur')) throw new Error('Localized notice not found in village matched query.');

    // Query for different village (should filter out localized notice)
    let listCodeDelhi = null;
    let listDataDelhi = null;

    const mockResListDelhi = {
      status: (code) => {
        listCodeDelhi = code;
        return {
          json: (data) => { listDataDelhi = data; }
        };
      }
    };

    const mockReqListDelhi = {
      query: { type: 'notice', village: 'Delhi' },
      userData: { userId: customerUser._id.toString(), role: 'user' }
    };

    await cmsController.getCMSContent(mockReqListDelhi, mockResListDelhi);
    const delhiTitles = listDataDelhi.data.map(item => item.title);
    console.log(`    Retrieved notices for village Delhi:`, delhiTitles);
    if (delhiTitles.includes('Localized Notice Rampur')) throw new Error('Target leak: Rampur notice leaked to Delhi user.');

    // Test 2.3: Admin query for all notices (Should see drafts/expired too)
    let adminListCode = null;
    let adminListData = null;

    const mockResListAdmin = {
      status: (code) => {
        adminListCode = code;
        return {
          json: (data) => { adminListData = data; }
        };
      }
    };

    const mockReqListAdmin = {
      query: { type: 'notice' },
      userData: { userId: adminUser._id.toString(), role: 'admin' }
    };

    await cmsController.getCMSContent(mockReqListAdmin, mockResListAdmin);
    const adminNoticeTitles = adminListData.data.map(item => item.title);
    console.log(`    Admin retrieved notices:`, adminNoticeTitles);
    if (!adminNoticeTitles.includes('Draft Notice') || !adminNoticeTitles.includes('Expired Notice')) {
      throw new Error('Admin bypass failure: Admin was unable to view drafts/expired items.');
    }
    console.log(' -> Admin listing query verified successfully.');


    // --- TEST 3: UPDATE & DELETE ENDPOINTS ---
    console.log('[5/5] Testing UPDATE & DELETE content endpoints:');

    // Test 3.1: Admin updates notice status to inactive
    let updateCode = null;
    let updateData = null;

    const mockResUpdate = {
      status: (code) => {
        updateCode = code;
        return {
          json: (data) => { updateData = data; }
        };
      }
    };

    const mockReqUpdate = {
      params: { id: announcementId.toString() },
      body: { title: 'Updated Maintenance Alert', isActive: false },
      userData: { userId: adminUser._id.toString(), role: 'admin' }
    };

    await cmsController.updateCMSContent(mockReqUpdate, mockResUpdate);
    console.log(` -> Admin update result (Expected 200): ${updateCode}, Title: ${updateData?.title}, isActive: ${updateData?.isActive}`);
    if (updateCode !== 200 || updateData?.title !== 'Updated Maintenance Alert' || updateData?.isActive !== false) {
      throw new Error('Update endpoint validation failed.');
    }

    // Test 3.2: Admin deletes notice
    let deleteCode = null;
    let deleteBody = null;

    const mockResDelete = {
      status: (code) => {
        deleteCode = code;
        return {
          json: (data) => { deleteBody = data; }
        };
      }
    };

    const mockReqDelete = {
      params: { id: announcementId.toString() },
      userData: { userId: adminUser._id.toString(), role: 'admin' }
    };

    await cmsController.deleteCMSContent(mockReqDelete, mockResDelete);
    console.log(` -> Admin delete result (Expected 200): ${deleteCode}`);
    if (deleteCode !== 200) throw new Error('Delete endpoint validation failed.');

    // Cleanup rest of items
    await CMSContent.deleteMany({ author: 'CMS_TEST_SUITE' });
    if (adminUser.email === 'temp-admin@example.com') {
      await User.deleteOne({ _id: adminUser._id });
    }
    
    console.log('Cleanup completed successfully.');
    console.log('=== CMS MODULE INTEGRATION TEST PASSED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('=== CMS MODULE INTEGRATION TEST FAILED ===');
    console.error(err);
    process.exit(1);
  }
};

runTest();
