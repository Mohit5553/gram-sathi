const Booking = require('../models/Booking');
const Tractor = require('../models/Tractor');
const JCB = require('../models/JCB');
const Labour = require('../models/Labour');
const Electrician = require('../models/Electrician');
const Plumber = require('../models/Plumber');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');
const { logAudit } = require('../utils/auditLogger');

exports.createBooking = asyncHandler(async (req, res) => {
  const { serviceType, providerId, bookingDate, durationHours, address, notes } = req.body;
  
  // Verify provider availability
  let provider;
  if (serviceType === 'Tractor') provider = await Tractor.findById(providerId).populate('owner', 'name mobile');
  if (serviceType === 'JCB') provider = await JCB.findById(providerId).populate('owner', 'name mobile');
  if (serviceType === 'Labour') provider = await Labour.findById(providerId).populate('user', 'name mobile');
  if (serviceType === 'Electrician') provider = await Electrician.findById(providerId).populate('user', 'name mobile');
  if (serviceType === 'Plumber') provider = await Plumber.findById(providerId).populate('user', 'name mobile');
  
  if (!provider) return res.status(404).json({ message: `${serviceType} not found` });
  if (!provider.isAvailable) return res.status(400).json({ message: `This ${serviceType} is currently unavailable` });

  // 1. Vacation Mode Check
  if (provider.availability?.vacationMode) {
    return res.status(400).json({ message: 'This provider is currently on vacation and not accepting bookings.' });
  }

  const bDate = new Date(bookingDate);
  const dateString = bDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // 2. Blocked Dates Check
  if (provider.availability?.blockedDates?.includes(dateString)) {
    return res.status(400).json({ message: 'The requested date is blocked by the provider.' });
  }

  // 3. Weekly Day Active Check
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = daysOfWeek[bDate.getDay()];
  if (provider.availability?.weekly && provider.availability.weekly[dayName] === false) {
    return res.status(400).json({ message: `This provider does not work on ${dayName}s.` });
  }

  // 4. Daily Hours Check
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

  if (reqStartMinutes < provStartMinutes || reqEndMinutes > provEndMinutes) {
    return res.status(400).json({ message: `Requested booking hours fall outside provider's daily work schedule (${dailyStart} - ${dailyEnd}).` });
  }

  // 5. Overlapping Accepted/In-Progress Bookings Check
  const startOfDay = new Date(bDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(bDate);
  endOfDay.setHours(23, 59, 59, 999);

  const conflictingBookings = await Booking.find({
    providerId: providerId,
    status: { $in: ['accepted', 'in_progress'] },
    bookingDate: { $gte: startOfDay, $lte: endOfDay }
  });

  for (const existing of conflictingBookings) {
    const existingStart = new Date(existing.bookingDate);
    const existingEnd = new Date(existingStart.getTime() + existing.durationHours * 60 * 60 * 1000);
    const newStart = bDate;
    const newEnd = new Date(newStart.getTime() + durationHours * 60 * 60 * 1000);

    if (newStart < existingEnd && newEnd > existingStart) {
      return res.status(400).json({ message: 'This provider is already booked during the requested slot.' });
    }
  }

  let totalAmount = 0;
  if (provider.ratePerHour) totalAmount = provider.ratePerHour * durationHours;
  else if (provider.dailyRate) totalAmount = provider.dailyRate * Math.ceil(durationHours / 8);
  else if (provider.visitCharge) totalAmount = provider.visitCharge;

  const commissionRate = 10;
  const commission = Math.round(totalAmount * (commissionRate / 100) * 100) / 100;
  const providerEarnings = Math.round((totalAmount - commission) * 100) / 100;

  const providerUser = provider.owner || provider.user;

  const booking = new Booking({
    user: req.userData.userId,
    serviceType,
    providerId,
    providerName: providerUser?.name || 'Provider',
    providerContact: providerUser?.mobile || 'N/A',
    bookingDate,
    durationHours,
    totalAmount,
    commissionRate,
    commission,
    providerEarnings,
    address,
    notes,
    paymentMethod: req.body.paymentMethod || 'Cash',
    status: 'pending',
    timeline: [{
      status: 'pending',
      description: `Booking request sent for ${serviceType}`
    }]
  });
  
  await booking.save();

  // FCM Notification to Provider
  let providerOwner;
  if (serviceType === 'Tractor') providerOwner = (await Tractor.findById(providerId))?.owner;
  else if (serviceType === 'JCB') providerOwner = (await JCB.findById(providerId))?.owner;
  else if (serviceType === 'Labour') providerOwner = (await Labour.findById(providerId))?.user;
  else if (serviceType === 'Electrician') providerOwner = (await Electrician.findById(providerId))?.user;
  else if (serviceType === 'Plumber') providerOwner = (await Plumber.findById(providerId))?.user;

  if (providerOwner) {
    const io = req.app.get('io');
    await NotificationService.dispatch({
      io,
      userId: providerOwner,
      title: 'New Booking Request',
      message: `You have a new ${serviceType} booking request.`,
      type: 'booking',
      relatedId: booking._id
    });
  }

  // Log booking creation
  logActivity({
    req,
    userId: req.userData.userId,
    action: 'BOOKING_CREATE',
    details: `Booking created for ${serviceType} with provider ${booking.providerName}. Total: Rs. ${totalAmount}`,
    metadata: { bookingId: booking._id, serviceType, totalAmount }
  });

  res.status(201).json(booking);
});

exports.getBookings = asyncHandler(async (req, res) => {
  const { paginateQuery } = require('../utils/paginate');
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const result = await paginateQuery(
    Booking, 
    { user: req.userData.userId }, 
    { skip: (page - 1) * limit, limit, page },
    { populate: 'review', sort: { createdAt: -1 } }
  );
  
  res.status(200).json(result);
});

exports.getProviderBookings = asyncHandler(async (req, res) => {
  const userId = req.userData.userId;
  const tractors = await Tractor.find({ owner: userId }).select('_id');
  const jcbs = await JCB.find({ owner: userId }).select('_id');
  const labours = await Labour.find({ user: userId }).select('_id');
  const electricians = await Electrician.find({ user: userId }).select('_id');
  const plumbers = await Plumber.find({ user: userId }).select('_id');

  const providerIds = [
    ...tractors.map(t => t._id),
    ...jcbs.map(j => j._id),
    ...labours.map(l => l._id),
    ...electricians.map(e => e._id),
    ...plumbers.map(p => p._id),
  ];

  if (providerIds.length === 0) {
    return res.status(200).json({ data: [], pagination: { total: 0, pages: 0, current: 1, limit: 10 } });
  }

  const { paginateQuery } = require('../utils/paginate');
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await paginateQuery(
    Booking, 
    { providerId: { $in: providerIds } }, 
    { skip: (page - 1) * limit, limit, page },
    { populate: { path: 'user', select: 'name mobile email' }, sort: { createdAt: -1 } }
  );

  res.status(200).json(result);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id).populate('user', '_id name');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  
  const currentStatus = booking.status;
  const serviceType = booking.serviceType;

  // Retrieve provider owner for ownership verification
  let providerOwner;
  if (serviceType === 'Tractor') providerOwner = (await Tractor.findById(booking.providerId))?.owner;
  else if (serviceType === 'JCB') providerOwner = (await JCB.findById(booking.providerId))?.owner;
  else if (serviceType === 'Labour') providerOwner = (await Labour.findById(booking.providerId))?.user;
  else if (serviceType === 'Electrician') providerOwner = (await Electrician.findById(booking.providerId))?.user;
  else if (serviceType === 'Plumber') providerOwner = (await Plumber.findById(booking.providerId))?.user;

  const isCustomer = req.userData.userId === booking.user._id.toString();
  const isProvider = providerOwner && req.userData.userId === providerOwner.toString();
  const isAdmin = req.userData.role === 'admin' || req.userData.role === 'super_admin';

  // 1. Ownership validation
  if (!isAdmin && !isCustomer && !isProvider) {
    return res.status(403).json({ message: 'Access Denied: You are not authorized to update this booking.' });
  }

  // 2. Action capability validation (Customers can only cancel bookings)
  if (isCustomer && !isProvider && !isAdmin && status !== 'cancelled') {
    return res.status(403).json({ message: 'Access Denied: Customers can only cancel bookings.' });
  }

  const validTransitions = {
    pending: ['accepted', 'rejected', 'cancelled'],
    accepted: (serviceType === 'Tractor' || serviceType === 'JCB') 
      ? ['in_progress', 'cancelled'] 
      : ['completed', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    rejected: [],
    cancelled: []
  };

  if (!validTransitions[currentStatus]?.includes(status)) {
    return res.status(400).json({ message: `Cannot transition booking from ${currentStatus} to ${status} for ${serviceType}` });
  }

  let targetUserId;
  let message;

  if (status === 'cancelled') {
      targetUserId = req.userData.userId === booking.user._id.toString() ? providerOwner : booking.user._id;
      message = `Booking for ${serviceType} has been cancelled by ${req.userData.userId === booking.user._id.toString() ? 'Customer' : 'Provider'}.`;
  } else {
      targetUserId = booking.user._id;
      message = `Your ${serviceType} booking is now ${status.replace('_', ' ')}.`;
  }

  booking.status = status;
  booking.timeline.push({
    status: status,
    description: message
  });
  await booking.save();

  if (targetUserId) {
      const io = req.app.get('io');
      await NotificationService.dispatch({
        io,
        userId: targetUserId,
        title: 'Booking Update',
        message: message,
        type: 'booking',
        relatedId: booking._id
      });

      // Still emit the specific bookingStatusUpdated event for UI refresh
      if (io) {
          io.to(targetUserId.toString()).emit('bookingStatusUpdated', booking);
      }
  }

  // Log booking status update
  logActivity({
    req,
    userId: req.userData.userId,
    action: 'BOOKING_STATUS_UPDATE',
    details: `Booking status for ${serviceType} updated from ${currentStatus} to ${status}`,
    metadata: { bookingId: booking._id, serviceType, oldStatus: currentStatus, newStatus: status }
  });

  logAudit({
    req,
    userId: req.userData.userId,
    action: 'BOOKING_UPDATE',
    details: `Booking status for ${serviceType} (ID: ${booking._id}) updated from ${currentStatus} to ${status}`,
    metadata: { bookingId: booking._id, serviceType, oldStatus: currentStatus, newStatus: status }
  });

  res.status(200).json(booking);
});
