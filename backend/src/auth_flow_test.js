const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const authController = require('./controllers/authController');

const runAuthTest = async () => {
  try {
    console.log('=== STARTING EMAIL OTP AUTH & PROFILE COMPLETION FLOW TEST ===');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/5] Connected to MongoDB.');

    const testEmail = 'new-auth-test-user@example.com';
    // Clean up any existing test user first
    await User.deleteMany({ email: testEmail });

    // 1. Send OTP (Simulates User Entering Email)
    console.log('[2/5] Sending OTP for new email:', testEmail);
    let sendOtpStatus = null;
    let sendOtpMsg = '';
    const mockResSendOtp = {
      status: (code) => {
        sendOtpStatus = code;
        return {
          json: (data) => {
            sendOtpMsg = data.message;
          }
        };
      }
    };
    const mockReqSendOtp = {
      body: { email: testEmail }
    };

    await authController.sendOtp(mockReqSendOtp, mockResSendOtp);
    console.log(` -> sendOtp status code: ${sendOtpStatus}, message: "${sendOtpMsg}"`);
    if (sendOtpStatus !== 200) {
      throw new Error(`Failed to send OTP. Status: ${sendOtpStatus}`);
    }

    // Verify user was created in the database with default role and no name
    const createdUser = await User.findOne({ email: testEmail });
    if (!createdUser) {
      throw new Error('User record was not created in DB.');
    }
    console.log(' -> User created in DB successfully.');
    console.log(' -> Default Role (should be user):', createdUser.role);
    if (createdUser.role !== 'user') {
      throw new Error(`Default role should be "user" but got "${createdUser.role}"`);
    }
    console.log(' -> Initial Name (should be undefined/none):', createdUser.name);
    if (createdUser.name !== undefined && createdUser.name !== null) {
      throw new Error(`Initial name should be undefined or null but got "${createdUser.name}"`);
    }

    // Retrieve generated OTP from DB
    const generatedOtp = createdUser.otp;
    console.log(' -> Generated OTP retrieved from database:', generatedOtp);

    // 2. Verify OTP (Simulates OTP submission)
    console.log('[3/5] Verifying OTP...');
    let verifyStatus = null;
    let verifyData = null;
    const mockResVerify = {
      status: (code) => {
        verifyStatus = code;
        return {
          json: (data) => {
            verifyData = data;
          }
        };
      }
    };
    const mockReqVerify = {
      body: { email: testEmail, otp: generatedOtp },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'node-test' },
      socket: { remoteAddress: '127.0.0.1' }
    };

    await authController.verifyOtp(mockReqVerify, mockResVerify);
    console.log(` -> verifyOtp status code: ${verifyStatus}`);
    if (verifyStatus !== 200) {
      throw new Error(`Failed to verify OTP. Status: ${verifyStatus}`);
    }
    console.log(' -> Verification payload profileCompleted:', verifyData.user?.profileCompleted);
    if (verifyData.user?.profileCompleted !== false) {
      throw new Error('profileCompleted should be false for newly created profile.');
    }
    if (!verifyData.accessToken || !verifyData.refreshToken) {
      throw new Error('Access token or Refresh token is missing from verification payload.');
    }
    console.log(' -> JWT Access Token & Refresh Token returned successfully.');

    // 3. Check profile (Simulates getProfile endpoint)
    console.log('[4/5] Getting profile to verify status...');
    let getProfileStatus = null;
    let getProfileData = null;
    const mockResGetProfile = {
      status: (code) => {
        getProfileStatus = code;
        return {
          json: (data) => {
            getProfileData = data;
          }
        };
      }
    };
    const mockReqGetProfile = {
      userData: { userId: createdUser._id.toString() }
    };

    await authController.getProfile(mockReqGetProfile, mockResGetProfile);
    if (getProfileStatus !== 200) {
      throw new Error(`Failed to get profile. Status: ${getProfileStatus}`);
    }
    console.log(' -> getProfile profileCompleted:', getProfileData.profileCompleted);
    if (getProfileData.profileCompleted !== false) {
      throw new Error('getProfile profileCompleted should be false.');
    }

    // 4. Update profile details (Simulates Profile completion page submission)
    console.log('[5/5] Submitting profile completion fields...');
    let updateStatus = null;
    let updateData = null;
    const mockResUpdate = {
      status: (code) => {
        updateStatus = code;
        return {
          json: (data) => {
            updateData = data;
          }
        };
      }
    };
    const mockReqUpdate = {
      userData: { userId: createdUser._id.toString() },
      body: {
        name: 'John Doe',
        state: 'Uttar Pradesh',
        district: 'Rampur',
        village: 'Kalyanpur'
      }
    };
    const mockNext = (err) => {
      if (err) throw err;
    };

    await authController.updateProfile(mockReqUpdate, mockResUpdate, mockNext);
    if (updateStatus !== 200) {
      throw new Error(`Failed to update profile. Status: ${updateStatus}`);
    }
    console.log(' -> updateProfile message:', updateData.message);
    console.log(' -> updateProfile updated user profileCompleted:', updateData.user?.profileCompleted);
    if (updateData.user?.profileCompleted !== true) {
      throw new Error('profileCompleted should be true after filling required fields.');
    }

    // Final check: retrieve profile again and ensure it reports completed: true
    getProfileStatus = null;
    getProfileData = null;
    await authController.getProfile(mockReqGetProfile, mockResGetProfile);
    console.log(' -> final getProfile profileCompleted:', getProfileData.profileCompleted);
    if (getProfileData.profileCompleted !== true) {
      throw new Error('Final getProfile profileCompleted check failed.');
    }

    // Clean up test user
    await User.deleteMany({ email: testEmail });
    console.log(' -> Test database records cleaned up successfully.');
    console.log('=== EMAIL OTP AUTH & PROFILE COMPLETION FLOW TEST PASSED ===');
    process.exit(0);
  } catch (error) {
    console.error('=== EMAIL OTP AUTH & PROFILE COMPLETION FLOW TEST FAILED ===');
    console.error(error);
    process.exit(1);
  }
};

runAuthTest();
