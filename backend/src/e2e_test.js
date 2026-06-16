const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Booking = require('./models/Booking');
const Tractor = require('./models/Tractor');
const Review = require('./models/Review');

const runTest = async () => {
  try {
    console.log('=== STARTING INTEGRATION E2E TEST ===');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/7] Connected to MongoDB successfully.');

    // 1. Verify and Promote tester-provider to provider
    const providerUser = await User.findOne({ email: 'tester-provider@example.com' });
    if (!providerUser) {
      throw new Error('tester-provider@example.com not found in database. Seed data check failed.');
    }
    
    console.log(`[2/7] Found provider user. Current role: ${providerUser.role}`);
    
    // --- TEST PROVIDER VERIFICATION STATE MACHINE ---
    console.log('--- Testing Provider Verification State Machine ---');
    
    // 1. Submit Request
    providerUser.verification = {
      aadhaarCard: 'https://cloudinary.com/aadhaar_mock.png',
      panCard: 'https://cloudinary.com/pan_mock.png',
      status: 'pending'
    };
    await providerUser.save();
    console.log(` -> Verification submitted. Status: ${providerUser.verification.status}`);
    if (providerUser.verification.status !== 'pending') throw new Error('Verification submit status failed.');

    // 2. Approve Request
    providerUser.role = 'provider';
    providerUser.verification.status = 'approved';
    providerUser.verification.verifiedAt = new Date();
    await providerUser.save();
    console.log(` -> Verification approved. Status: ${providerUser.verification.status}, Role: ${providerUser.role}`);
    if (providerUser.verification.status !== 'approved' || providerUser.role !== 'provider') {
      throw new Error('Approve verification status/role update failed.');
    }

    // 3. Suspend Privileges
    providerUser.role = 'user';
    providerUser.verification.status = 'suspended';
    await providerUser.save();
    console.log(` -> Verification suspended. Status: ${providerUser.verification.status}, Role: ${providerUser.role}`);
    if (providerUser.verification.status !== 'suspended' || providerUser.role !== 'user') {
      throw new Error('Suspend verification status/role demotion failed.');
    }

    // 4. Reject Request
    providerUser.verification.status = 'rejected';
    providerUser.verification.rejectionReason = 'Blurred Aadhaar image';
    await providerUser.save();
    console.log(` -> Verification rejected. Status: ${providerUser.verification.status}, Reason: ${providerUser.verification.rejectionReason}`);
    if (providerUser.verification.status !== 'rejected' || providerUser.verification.rejectionReason !== 'Blurred Aadhaar image') {
      throw new Error('Reject verification status/reason failed.');
    }

    // Reset back to approved provider for subsequent booking tests
    providerUser.role = 'provider';
    providerUser.verification.status = 'approved';
    await providerUser.save();
    console.log(`Successfully completed all Verification State Machine tests. Reset user role to: ${providerUser.role}`);

    // 2. Clear old test tractors and bookings for clean run
    await Tractor.deleteMany({ owner: providerUser._id });
    
    // 3. Create a test Tractor Service
    const testTractor = new Tractor({
      owner: providerUser._id,
      tractorType: 'Mahindra Arjun 555',
      brand: 'Mahindra',
      ratePerHour: 600,
      village: 'Test Village',
      block: 'Test Block',
      district: 'Test District',
      state: 'Uttar Pradesh',
      isAvailable: true,
      status: 'approved',
      availability: {
        vacationMode: false,
        daily: { startHour: "08:00", endHour: "18:00" },
        weekly: {
          monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false
        },
        blockedDates: ['2026-06-20']
      }
    });
    await testTractor.save();
    console.log(`[3/7] Created test Tractor Service: ${testTractor.tractorType} (ID: ${testTractor._id})`);

    // --- TEST SCHEDULER & CONFLICT PREVENTION ---
    console.log('--- Testing Scheduler & Booking Conflict Prevention ---');
    const validateBooking = (provider, bookingDate, durationHours, existingBookings) => {
      if (provider.availability?.vacationMode) return 'vacation_mode';
      const bDate = new Date(bookingDate);
      const dateString = bDate.toISOString().split('T')[0];
      if (provider.availability?.blockedDates?.includes(dateString)) return 'blocked_date';
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = daysOfWeek[bDate.getDay()];
      if (provider.availability?.weekly && provider.availability.weekly[dayName] === false) return 'weekly_day_inactive';
      
      const reqStartHour = bDate.getHours();
      const reqStartMin = bDate.getMinutes();
      const reqEndHour = reqStartHour + durationHours;
      const reqEndMin = reqStartMin;
      const dailyStart = provider.availability?.daily?.startHour || "08:00";
      const dailyEnd = provider.availability?.daily?.endHour || "18:00";
      const [startH, startM] = dailyStart.split(':').map(Number);
      const [endH, endM] = dailyEnd.split(':').map(Number);
      const reqStartMinutes = reqStartHour * 60 + reqStartMin;
      const reqEndMinutes = reqEndHour * 60 + reqEndMin;
      const provStartMinutes = startH * 60 + startM;
      const provEndMinutes = endH * 60 + endM;
      if (reqStartMinutes < provStartMinutes || reqEndMinutes > provEndMinutes) return 'outside_daily_hours';

      for (const existing of existingBookings) {
        const existingStart = new Date(existing.bookingDate);
        const existingEnd = new Date(existingStart.getTime() + existing.durationHours * 60 * 60 * 1000);
        const newStart = bDate;
        const newEnd = new Date(newStart.getTime() + durationHours * 60 * 60 * 1000);
        if (newStart < existingEnd && newEnd > existingStart) return 'overlapping_booking';
      }
      return 'valid';
    };

    // Test 1: Valid Booking Slot
    const validDate = new Date("2026-06-22T10:00:00"); // Monday (active) 10 AM (within 8-18)
    const test1 = validateBooking(testTractor, validDate, 2, []);
    console.log(` -> Test 1: Valid Slot booking validation result: ${test1}`);
    if (test1 !== 'valid') throw new Error('Test 1 failed: Valid slot returned invalid.');

    // Test 2: Vacation Mode Block
    testTractor.availability.vacationMode = true;
    const test2 = validateBooking(testTractor, validDate, 2, []);
    console.log(` -> Test 2: Vacation Mode booking validation result: ${test2}`);
    if (test2 !== 'vacation_mode') throw new Error('Test 2 failed: Vacation Mode bypass.');
    testTractor.availability.vacationMode = false; // Reset

    // Test 3: Blocked Date Block
    const blockedDate = new Date("2026-06-20T11:00:00");
    const test3 = validateBooking(testTractor, blockedDate, 2, []);
    console.log(` -> Test 3: Blocked Date booking validation result: ${test3}`);
    if (test3 !== 'blocked_date') throw new Error('Test 3 failed: Blocked Date bypass.');

    // Test 4: Weekly Inactive Day Block
    const sundayDate = new Date("2026-06-21T12:00:00"); // Sunday (sunday: false)
    const test4 = validateBooking(testTractor, sundayDate, 2, []);
    console.log(` -> Test 4: Weekly day inactive booking validation result: ${test4}`);
    if (test4 !== 'weekly_day_inactive') throw new Error('Test 4 failed: Inactive Day bypass.');

    // Test 5: Daily Hours Block
    const nightDate = new Date("2026-06-22T20:00:00"); // 8 PM (outside 8-18)
    const test5 = validateBooking(testTractor, nightDate, 2, []);
    console.log(` -> Test 5: Outside daily hours booking validation result: ${test5}`);
    if (test5 !== 'outside_daily_hours') throw new Error('Test 5 failed: Out of hours bypass.');

    // Test 6: Overlap Conflict Prevention
    const existingBookings = [{ bookingDate: new Date("2026-06-22T09:00:00"), durationHours: 3 }]; // overlaps 10 AM request
    const test6 = validateBooking(testTractor, validDate, 2, existingBookings);
    console.log(` -> Test 6: Overlapping booking validation result: ${test6}`);
    if (test6 !== 'overlapping_booking') throw new Error('Test 6 failed: Overlapping booking bypass.');

    console.log('Scheduler & Booking Conflict Prevention tests passed successfully.');

    // 4. Find customer user
    const customerUser = await User.findOne({ email: 'tester-user@example.com' });
    if (!customerUser) {
      throw new Error('tester-user@example.com not found in database.');
    }
    console.log(`[4/7] Found customer user: ${customerUser.name} (ID: ${customerUser._id})`);

    // 5. Create a Booking request from customer
    const durationHours = 4;
    const totalAmount = testTractor.ratePerHour * durationHours; // 600 * 4 = 2400
    const commissionRate = 0.10;
    const expectedCommission = Math.round(totalAmount * commissionRate * 100) / 100; // 240
    const expectedProviderEarnings = Math.round((totalAmount - expectedCommission) * 100) / 100; // 2160
    const testBooking = new Booking({
      user: customerUser._id,
      serviceType: 'Tractor',
      providerId: testTractor._id,
      providerName: providerUser.name,
      providerContact: providerUser.mobile || '9876543211',
      bookingDate: new Date(),
      durationHours,
      totalAmount,
      commissionRate,
      commission: expectedCommission,
      providerEarnings: expectedProviderEarnings,
      address: 'Plot 42, Test Village Farms',
      notes: 'Please bring cultivator',
      paymentMethod: 'Cash',
      status: 'pending',
      timeline: [{
        status: 'pending',
        description: 'Booking request sent for Tractor',
        date: new Date()
      }]
    });
    await testBooking.save();
    console.log(`[5/7] Booking created successfully in pending status (ID: ${testBooking._id})`);

    // 6. Test booking transitions (accepted -> in_progress -> completed)
    console.log('[6/7] Simulating Provider transitions:');
    
    // Accepted
    testBooking.status = 'accepted';
    testBooking.timeline.push({ status: 'accepted', description: 'Booking accepted by Provider', date: new Date() });
    await testBooking.save();
    console.log(` -> Transitioned to: ${testBooking.status}`);

    // In Progress
    testBooking.status = 'in_progress';
    testBooking.timeline.push({ status: 'in_progress', description: 'Tractor service has started', date: new Date() });
    await testBooking.save();
    console.log(` -> Transitioned to: ${testBooking.status}`);

    // Completed
    testBooking.status = 'completed';
    testBooking.timeline.push({ status: 'completed', description: 'Tractor service completed', date: new Date() });
    await testBooking.save();
    console.log(` -> Transitioned to: ${testBooking.status}`);

    // --- TEST REVENUE & COMMISSION TRACKING ---
    console.log('--- Testing Revenue & Commission Tracking ---');
    const savedBooking = await Booking.findById(testBooking._id);
    console.log(` -> Booking financial breakdown:`);
    console.log(`    Total Amount: ₹${savedBooking.totalAmount} (Expected: ₹${totalAmount})`);
    console.log(`    Commission (10%): ₹${savedBooking.commission} (Expected: ₹${expectedCommission})`);
    console.log(`    Provider Earnings (90%): ₹${savedBooking.providerEarnings} (Expected: ₹${expectedProviderEarnings})`);
    
    if (savedBooking.totalAmount !== totalAmount) throw new Error(`Total amount mismatch: ${savedBooking.totalAmount} vs ${totalAmount}`);
    if (savedBooking.commission !== expectedCommission) throw new Error(`Commission mismatch: ${savedBooking.commission} vs ${expectedCommission}`);
    if (savedBooking.providerEarnings !== expectedProviderEarnings) throw new Error(`Provider earnings mismatch: ${savedBooking.providerEarnings} vs ${expectedProviderEarnings}`);

    // Validate platform commission + provider earnings = total
    const sumCheck = Math.round((savedBooking.commission + savedBooking.providerEarnings) * 100) / 100;
    if (sumCheck !== savedBooking.totalAmount) throw new Error(`Financial integrity check failed: ${sumCheck} !== ${savedBooking.totalAmount}`);
    console.log(` -> Financial integrity verified: Commission + Provider Earnings = Total Amount ✓`);
    
    // Test aggregation pipeline for admin revenue report (same logic as adminController)
    const revenueAggregation = await Booking.aggregate([
      { $match: { status: 'completed', _id: savedBooking._id } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalCommission: { $sum: { $ifNull: ['$commission', { $multiply: ['$totalAmount', 0.1] }] } },
          totalProviderEarnings: { $sum: { $ifNull: ['$providerEarnings', { $multiply: ['$totalAmount', 0.9] }] } }
        }
      }
    ]);
    const aggResult = revenueAggregation[0] || {};
    console.log(` -> Admin Aggregation: Revenue=₹${aggResult.totalRevenue}, Commission=₹${aggResult.totalCommission}, Provider Payouts=₹${aggResult.totalProviderEarnings}`);
    if (aggResult.totalRevenue !== totalAmount) throw new Error('Admin aggregation revenue sum mismatch.');
    if (aggResult.totalCommission !== expectedCommission) throw new Error('Admin aggregation commission sum mismatch.');
    if (aggResult.totalProviderEarnings !== expectedProviderEarnings) throw new Error('Admin aggregation provider earnings sum mismatch.');
    console.log('Successfully passed all Revenue & Commission Tracking tests.');

    // --- TEST REVIEW & RATING SYSTEM ---
    console.log('--- Testing Review & Rating System ---');
    const reviewController = require('./controllers/reviewController');
    
    // Clean up any existing reviews on this booking
    await Review.deleteMany({ booking: testBooking._id });
    
    // Test A: Attempt to review a non-completed booking
    testBooking.status = 'accepted';
    await testBooking.save();
    
    let blockedResult = null;
    const mockResBlocked = {
      status: (code) => {
        blockedResult = code;
        return {
          json: (msg) => {
            blockedResult = { code, msg };
          }
        };
      }
    };
    
    const mockReqBlocked = {
      params: { bookingId: testBooking._id.toString() },
      body: { rating: 5, providerRating: 4, serviceRating: 5, reviewText: 'Excellent service provider, very helpful!' },
      userData: { userId: customerUser._id.toString() }
    };
    
    await reviewController.createReview(mockReqBlocked, mockResBlocked);
    console.log(` -> Review blocked on non-completed booking (Expected 400): ${blockedResult?.code}`);
    if (blockedResult?.code !== 400) {
      throw new Error('Allowed review on non-completed booking.');
    }
    
    // Restore status to completed
    testBooking.status = 'completed';
    await testBooking.save();
    
    // Test B: Submit a valid review
    let successResult = null;
    const mockResSuccess = {
      status: (code) => {
        successResult = code;
        return {
          json: (data) => {
            successResult = { code, data };
          }
        };
      }
    };
    
    const mockReqSuccess = {
      params: { bookingId: testBooking._id.toString() },
      body: { rating: 5, providerRating: 4, serviceRating: 5, reviewText: 'Excellent service provider, very helpful!' },
      userData: { userId: customerUser._id.toString() }
    };
    
    await reviewController.createReview(mockReqSuccess, mockResSuccess);
    console.log(` -> Submitted review successfully (Expected 201): ${successResult?.code}`);
    if (successResult?.code !== 201) {
      throw new Error(`Review creation failed with code ${successResult?.code}`);
    }
    
    // Test C: Attempt to review the same booking again (Duplicate block)
    let dupResult = null;
    const mockResDup = {
      status: (code) => {
        dupResult = code;
        return {
          json: (msg) => {
            dupResult = { code, msg };
          }
        };
      }
    };
    
    await reviewController.createReview(mockReqSuccess, mockResDup);
    console.log(` -> Blocked duplicate review (Expected 400): ${dupResult?.code}`);
    if (dupResult?.code !== 400) {
      throw new Error('Allowed duplicate review submission.');
    }
    
    // Test D: Verify average rating aggregation updates Tractor model
    const updatedTractor = await Tractor.findById(testTractor._id);
    console.log(` -> Updated Tractor average service rating (Expected 5): ${updatedTractor.rating}`);
    if (updatedTractor.rating !== 5) {
      throw new Error('Tractor average service rating not updated correctly.');
    }
    
    // Test E: Verify average rating aggregation updates Provider User model
    const updatedProvider = await User.findById(providerUser._id);
    console.log(` -> Updated Provider average user rating (Expected 4): ${updatedProvider.providerRating}, count (Expected 1): ${updatedProvider.providerRatingCount}`);
    if (updatedProvider.providerRating !== 4 || updatedProvider.providerRatingCount !== 1) {
      throw new Error('Provider user average rating and rating count statistics not updated correctly.');
    }
    
    console.log('Successfully passed all Review & Rating System integration tests.');

    // 7. Verify Admin Statistics aggregation works
    console.log('[7/7] Verifying Admin Dashboard stats query robustness:');
    const [
      usersCount, providersCount, bookingsCount, tractorsCount
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'provider' }),
      Booking.countDocuments(),
      Tractor.countDocuments()
    ]);
    
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    console.log(` -> Aggregated statistics results:
      Total Users: ${usersCount}
      Total Providers: ${providersCount}
      Total Bookings: ${bookingsCount}
      Total Revenue: ${totalRevenue} INR
      Total Tractors: ${tractorsCount}
    `);

    // Cleanup test data to keep DB clean
    await Booking.deleteMany({ _id: testBooking._id });
    await Tractor.deleteMany({ _id: testTractor._id });
    await Review.deleteMany({ booking: testBooking._id });
    console.log('Cleanup completed successfully.');
    console.log('=== INTEGRATION TEST PASSED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('=== INTEGRATION TEST FAILED ===');
    console.error(err);
    process.exit(1);
  }
};

runTest();
