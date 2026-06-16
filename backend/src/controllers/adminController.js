const User = require('../models/User');
const Booking = require('../models/Booking');
const Tractor = require('../models/Tractor');
const JCB = require('../models/JCB');
const Labour = require('../models/Labour');
const Electrician = require('../models/Electrician');
const Plumber = require('../models/Plumber');
const GovernmentScheme = require('../models/GovernmentScheme');
const LostFound = require('../models/LostFound');
const EmergencyContact = require('../models/EmergencyContact');
const { logActivity } = require('../utils/activityLogger');
const { logAudit } = require('../utils/auditLogger');
const SystemConfig = require('../models/SystemConfig');

exports.getStats = async (req, res) => {
  try {
    const [
      usersCount, providersCount, bookingsCount, tractorsCount, jcbsCount, 
      laboursCount, electriciansCount, plumbersCount, schemesCount,
      lostFoundCount, emergencyCount
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'provider' }),
      Booking.countDocuments(),
      Tractor.countDocuments(),
      JCB.countDocuments(),
      Labour.countDocuments(),
      Electrician.countDocuments(),
      Plumber.countDocuments(),
      GovernmentScheme.countDocuments(),
      LostFound.countDocuments(),
      EmergencyContact.countDocuments()
    ]);

    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const pendingBookingsCount = await Booking.countDocuments({ status: 'pending' });

    const activeVillages = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: { $ifNull: ['$customer.village', 'Unknown'] },
          count: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: 'Unknown' }, _id: { $ne: '' } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const mostActiveVillage = activeVillages.length > 0 ? activeVillages[0]._id : 'N/A';

    res.status(200).json({
      users: usersCount + providersCount,
      providers: providersCount,
      bookings: bookingsCount,
      revenue: totalRevenue,
      pendingBookings: pendingBookingsCount,
      completedBookings: completedBookings.length,
      mostActiveVillage,
      services: tractorsCount + jcbsCount + laboursCount + electriciansCount + plumbersCount,
      schemes: schemesCount,
      lostFound: lostFoundCount,
      emergency: emergencyCount,
      breakdown: {
        tractors: tractorsCount,
        jcb: jcbsCount,
        labour: laboursCount,
        electricians: electriciansCount,
        plumbers: plumbersCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: lastWeek }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          commission: { $sum: { $ifNull: ["$commission", { $multiply: ["$totalAmount", 0.1] }] } },
          providerEarnings: { $sum: { $ifNull: ["$providerEarnings", { $multiply: ["$totalAmount", 0.9] }] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayData = stats.find(s => s._id === dateStr) || { bookings: 0, revenue: 0, commission: 0, providerEarnings: 0 };
      result.push({
        name: dayName,
        date: dateStr,
        bookings: dayData.bookings,
        revenue: dayData.revenue,
        commission: dayData.commission,
        providerEarnings: dayData.providerEarnings
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, role } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = { role: { $ne: 'provider' } };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, mobile, role, village, district, state, status, permissions } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (req.userData.role !== 'super_admin') {
      if (targetUser.role === 'admin' || targetUser.role === 'super_admin') {
        return res.status(403).json({ message: 'Access Denied: Standard admins cannot modify other admins or super admins.' });
      }
      if (role === 'admin' || role === 'super_admin') {
        return res.status(403).json({ message: 'Access Denied: Standard admins cannot grant admin or super admin privileges.' });
      }
      if (permissions !== undefined) {
        return res.status(403).json({ message: 'Access Denied: Standard admins cannot modify role permissions.' });
      }
    }

    const previousRole = targetUser.role;

    const updateData = { name, email, mobile, role, village, district, state, status };
    if (permissions !== undefined) updateData.permissions = permissions;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_USER_UPDATE',
      details: `Updated user profile for "${user.name}" (${user.email})`,
      metadata: { targetUserId: user._id, updatedFields: req.body }
    });

    if (previousRole !== role || status !== targetUser.status || permissions !== undefined) {
      logAudit({
        req,
        userId: req.userData.userId,
        action: 'ROLE_CHANGES',
        details: `Modified role/permissions/status for user "${user.name}" (${user.email}). Role: ${previousRole} -> ${role || previousRole}, Status: ${targetUser.status} -> ${status || targetUser.status}`,
        metadata: { targetUserId: user._id, previousRole, newRole: role, previousStatus: targetUser.status, newStatus: status }
      });
    }

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (req.userData.role !== 'super_admin' && (targetUser.role === 'admin' || targetUser.role === 'super_admin')) {
      return res.status(403).json({ message: 'Access Denied: Standard admins cannot delete admin accounts.' });
    }

    await User.findByIdAndDelete(req.params.id);

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_USER_DELETE',
      details: `Deleted user account "${targetUser.name}" (${targetUser.email})`,
      metadata: { targetUserId: targetUser._id, targetName: targetUser.name, targetEmail: targetUser.email }
    });

    logAudit({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_ACTION',
      details: `Permanently deleted user account "${targetUser.name}" (${targetUser.email})`,
      metadata: { targetUserId: targetUser._id }
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = { role: 'provider' };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProviderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'banned', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'provider' },
      { status },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_PROVIDER_STATUS',
      details: `Updated status for provider "${provider.name}" (${provider.email}) to ${status}`,
      metadata: { targetUserId: provider._id, status }
    });

    res.status(200).json({ message: 'Provider status updated', provider });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    const provider = await User.findOneAndDelete({ _id: req.params.id, role: 'provider' });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_PROVIDER_DELETE',
      details: `Deleted provider account "${provider.name}" (${provider.email}) and all service listings`,
      metadata: { targetUserId: provider._id, targetName: provider.name, targetEmail: provider.email }
    });

    // Also delete service provider listings for this user:
    await Promise.all([
      Tractor.deleteMany({ owner: req.params.id }),
      JCB.deleteMany({ owner: req.params.id }),
      Labour.deleteMany({ owner: req.params.id }),
      Electrician.deleteMany({ owner: req.params.id }),
      Plumber.deleteMany({ owner: req.params.id })
    ]);
    
    res.status(200).json({ message: 'Provider and service listings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, serviceType } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (serviceType && serviceType !== 'all') query.serviceType = serviceType;

    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { serviceType: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name mobile email')
        .populate('provider', 'name mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    booking.timeline.push({
      status,
      description: `Booking status updated to ${status} by Admin`,
      date: new Date()
    });

    await booking.save();

    // Send notifications to Customer and Provider
    const NotificationService = require('../services/NotificationService');
    const io = req.app.get('io');
    const serviceType = booking.serviceType;
    const messageText = `Booking for ${serviceType} has been updated to ${status.replace('_', ' ')} by Admin.`;

    let providerOwner;
    if (serviceType === 'Tractor') providerOwner = (await Tractor.findById(booking.providerId))?.owner;
    else if (serviceType === 'JCB') providerOwner = (await JCB.findById(booking.providerId))?.owner;
    else if (serviceType === 'Labour') providerOwner = (await Labour.findById(booking.providerId))?.user;
    else if (serviceType === 'Electrician') providerOwner = (await Electrician.findById(booking.providerId))?.user;
    else if (serviceType === 'Plumber') providerOwner = (await Plumber.findById(booking.providerId))?.user;

    await Promise.all([
      // Notify customer
      NotificationService.dispatch({
        io,
        userId: booking.user,
        title: 'Booking Update',
        message: messageText,
        type: 'booking',
        relatedId: booking._id
      }),
      // Notify provider if provider owner exists
      providerOwner ? NotificationService.dispatch({
        io,
        userId: providerOwner,
        title: 'Booking Update',
        message: messageText,
        type: 'booking',
        relatedId: booking._id
      }) : Promise.resolve()
    ]);

    // Emit live refreshes
    if (io) {
      io.to(booking.user.toString()).emit('bookingStatusUpdated', booking);
      if (providerOwner) {
        io.to(providerOwner.toString()).emit('bookingStatusUpdated', booking);
      }
    }

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_BOOKING_STATUS',
      details: `Updated booking status for ${serviceType} (ID: ${booking._id}) to ${status}`,
      metadata: { bookingId: booking._id, serviceType, status }
    });

    res.status(200).json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_BOOKING_DELETE',
      details: `Deleted booking for ${booking.serviceType} (ID: ${booking._id})`,
      metadata: { bookingId: booking._id, serviceType: booking.serviceType }
    });

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lost & Found Management
exports.getAllLostFound = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type, status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      LostFound.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      LostFound.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLostFound = async (req, res) => {
  try {
    const { title, description, location, contactName, contactNumber, type, status } = req.body;
    const item = await LostFound.findByIdAndUpdate(
      req.params.id,
      { title, description, location, contactName, contactNumber, type, status },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Lost & Found item not found' });
    res.status(200).json({ message: 'Lost & Found item updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLostFound = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lost & Found item not found' });
    res.status(200).json({ message: 'Lost & Found item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Emergency Contacts Management
exports.getAllEmergencyContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (category && category !== 'All' && category !== 'all') query.category = category;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      EmergencyContact.find(query).sort({ category: 1, name: 1 }).skip(skip).limit(limitNum).lean(),
      EmergencyContact.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmergencyContact = async (req, res) => {
  try {
    const contact = new EmergencyContact(req.body);
    await contact.save();
    res.status(201).json({ message: 'Emergency contact created successfully', contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ message: 'Emergency contact not found' });
    res.status(200).json({ message: 'Emergency contact updated successfully', contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Emergency contact not found' });
    res.status(200).json({ message: 'Emergency contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Notifications Management
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const Notification = require('../models/Notification');
    let match = { type: 'system' };

    if (search) {
      match.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

        const agg = [
      { $match: match },
      {
        $group: {
          _id: { title: '$title', message: '$message' },
          title: { $first: '$title' },
          message: { $first: '$message' },
          type: { $first: '$type' },
          createdAt: { $first: '$createdAt' },
          sampleId: { $first: '$_id' }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: '$sampleId',
          title: 1,
          message: 1,
          type: 1,
          createdAt: 1
        }
      }
    ];

    const allDocs = await Notification.aggregate(agg);
    const total = allDocs.length;
    const data = allDocs.slice(skip, skip + limitNum);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });

    const query = targetRole === 'all' ? {} : { role: targetRole };
    const users = await User.find(query).select('_id');

    if (users.length === 0) return res.status(404).json({ message: 'No users found for this target' });

    const Notification = require('../models/Notification');
    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type: 'system'
    }));

    await Notification.insertMany(notifications);

    const io = req.app.get('io');
    if (io) {
      if (targetRole === 'all') {
        io.emit('newNotification', { title, message, type: 'system', createdAt: new Date() });
      } else {
        users.forEach(u => io.to(u._id.toString()).emit('newNotification', { title, message, type: 'system', createdAt: new Date() }));
      }
    }

    res.status(200).json({ message: `Notification broadcasted to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const sample = await Notification.findById(req.params.id);
    if (!sample) return res.status(404).json({ message: 'Notification not found' });

    await Notification.deleteMany({ title: sample.title, message: sample.message, type: 'system' });
    res.status(200).json({ message: 'Notification broadcast deleted from history' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const [totalUsers, totalProviders, totalBookings, activeUsers, activeProviders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'provider' }),
      Booking.countDocuments(),
      User.countDocuments({ status: 'active', role: 'user' }),
      User.countDocuments({ status: 'active', role: 'provider' })
    ]);

    const dailyRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          commission: { $sum: { $ifNull: ["$commission", { $multiply: ["$totalAmount", 0.1] }] } },
          providerEarnings: { $sum: { $ifNull: ["$providerEarnings", { $multiply: ["$totalAmount", 0.9] }] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { 
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          commission: { $sum: { $ifNull: ["$commission", { $multiply: ["$totalAmount", 0.1] }] } },
          providerEarnings: { $sum: { $ifNull: ["$providerEarnings", { $multiply: ["$totalAmount", 0.9] }] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const serviceDemand = await Booking.aggregate([
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [ { $eq: ["$status", "completed"] }, "$totalAmount", 0 ] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const activeVillages = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: { $ifNull: ['$customer.village', 'Unknown'] },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [ { $eq: ["$status", "completed"] }, "$totalAmount", 0 ] } }
        }
      },
      { $match: { _id: { $ne: 'Unknown' }, _id: { $ne: '' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const providerEarnings = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: "$providerId",
          providerName: { $first: "$providerName" },
          totalBookings: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          totalCommission: { $sum: { $ifNull: ["$commission", { $multiply: ["$totalAmount", 0.1] }] } },
          totalEarnings: { $sum: { $ifNull: ["$providerEarnings", { $multiply: ["$totalAmount", 0.9] }] } }
        }
      },
      { $sort: { totalEarnings: -1 } }
    ]);

    res.status(200).json({
      summary: {
        totalUsers,
        totalProviders,
        totalBookings,
        activeUsers,
        activeProviders,
        totalRevenue: monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0),
        totalCommission: monthlyRevenue.reduce((sum, item) => sum + item.commission, 0),
        totalProviderEarnings: monthlyRevenue.reduce((sum, item) => sum + item.providerEarnings, 0)
      },
      dailyRevenue,
      monthlyRevenue,
      serviceDemand,
      statusBreakdown,
      activeVillages,
      providerEarnings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = { 'verification.status': { $ne: 'unsubmitted' } };

    if (status && status !== 'all') {
      query['verification.status'] = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const [data, total] = await Promise.all([
      User.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'provider';
    user.verification.status = 'approved';
    user.verification.rejectionReason = undefined;
    user.verification.verifiedAt = new Date();

    await user.save();

    // Dispatch real-time notifications
    const NotificationService = require('../services/NotificationService');
    const io = req.app.get('io');
    const message = 'Congratulations! Your profile has been verified. You can now access all provider services.';
    
    await NotificationService.dispatch({
      io,
      userId: user._id,
      title: 'Profile Verified! ⚡',
      message: message,
      type: 'system',
      relatedId: user._id
    });

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_VERIFY_APPROVE',
      details: `Approved verification request for user "${user.name}" (${user.email}), role updated to provider`,
      metadata: { targetUserId: user._id }
    });

    logAudit({
      req,
      userId: req.userData.userId,
      action: 'PROVIDER_APPROVAL',
      details: `Approved verification request for user "${user.name}" (${user.email}), role updated to provider`,
      metadata: { targetUserId: user._id }
    });

    res.status(200).json({ message: 'Provider verification approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verification.status = 'rejected';
    user.verification.rejectionReason = rejectionReason;
    user.verification.verifiedAt = undefined;

    await user.save();

    // Dispatch notifications
    const NotificationService = require('../services/NotificationService');
    const io = req.app.get('io');
    const message = `Your provider verification request was rejected. Reason: ${rejectionReason}`;

    await NotificationService.dispatch({
      io,
      userId: user._id,
      title: 'Verification Rejected',
      message: message,
      type: 'system',
      relatedId: user._id
    });

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_VERIFY_REJECT',
      details: `Rejected verification request for user "${user.name}" (${user.email}). Reason: ${rejectionReason}`,
      metadata: { targetUserId: user._id, rejectionReason }
    });

    logAudit({
      req,
      userId: req.userData.userId,
      action: 'PROVIDER_APPROVAL',
      details: `Rejected verification request for user "${user.name}" (${user.email}). Reason: ${rejectionReason}`,
      metadata: { targetUserId: user._id, rejectionReason }
    });

    res.status(200).json({ message: 'Provider verification rejected successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.suspendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'user'; // demote to standard user to block provider actions
    user.verification.status = 'suspended';

    await user.save();

    // Dispatch notifications
    const NotificationService = require('../services/NotificationService');
    const io = req.app.get('io');
    const message = 'Your provider verification status has been suspended by the administrator.';

    await NotificationService.dispatch({
      io,
      userId: user._id,
      title: 'Verification Suspended ⚠️',
      message: message,
      type: 'system',
      relatedId: user._id
    });

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_VERIFY_SUSPEND',
      details: `Suspended verification for user "${user.name}" (${user.email}), role demoted to user`,
      metadata: { targetUserId: user._id }
    });

    logAudit({
      req,
      userId: req.userData.userId,
      action: 'PROVIDER_APPROVAL',
      details: `Suspended verification for user "${user.name}" (${user.email}), role demoted to user`,
      metadata: { targetUserId: user._id }
    });

    res.status(200).json({ message: 'Provider verification suspended successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role, category } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (role && role !== 'all') {
      query.userRole = role;
    }

    if (category && category !== 'all') {
      if (category === 'auth') {
        query.action = { $regex: /^AUTH_/ };
      } else if (category === 'booking') {
        query.action = { $regex: /^BOOKING_/ };
      } else if (category === 'admin') {
        query.action = { $regex: /^ADMIN_/ };
      } else if (category === 'content') {
        query.action = { $regex: /^(CMS_|SCHEME_)/ };
      } else {
        query.action = category;
      }
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const ActivityLog = require('../models/ActivityLog');

    const [data, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const backupManager = require('../utils/backupManager');
const fs = require('fs');
const path = require('path');

exports.getBackups = async (req, res) => {
  try {
    const ledger = backupManager.readLedger();
    
    // Compute disk stats
    let totalSize = 0;
    let successCount = 0;
    let failedCount = 0;
    
    ledger.forEach(b => {
      if (b.status === 'success') {
        totalSize += b.size || 0;
        successCount++;
      } else {
        failedCount++;
      }
    });

    res.status(200).json({
      data: ledger,
      stats: {
        totalSize,
        successCount,
        failedCount,
        storageUsedHuman: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.triggerManualBackup = async (req, res) => {
  try {
    const backup = await backupManager.createBackup('manual');
    
    if (backup.status === 'success') {
      logActivity({
        req,
        userId: req.userData.userId,
        action: 'ADMIN_BACKUP_CREATE',
        details: `Created manual database backup "${backup.filename}"`,
        metadata: { filename: backup.filename, size: backup.size }
      });
      res.status(201).json({ message: 'Backup created successfully', backup });
    } else {
      res.status(500).json({ message: 'Backup creation failed', error: backup.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restoreBackupFromFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await backupManager.restoreBackup(filename);
    
    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_BACKUP_RESTORE',
      details: `Restored database from backup file "${filename}"`,
      metadata: { filename, restoredAt: result.timestamp }
    });

    res.status(200).json({ message: 'Database restored successfully', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBackupFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(backupManager.BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update ledger to mark deleted or completely remove it
    let ledger = backupManager.readLedger();
    ledger = ledger.filter(b => b.filename !== filename);
    backupManager.writeLedger(ledger);

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_BACKUP_DELETE',
      details: `Deleted database backup file "${filename}"`,
      metadata: { filename }
    });

    res.status(200).json({ message: 'Backup file deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadBackupFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(backupManager.BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadAndRestoreBackup = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No backup file uploaded' });
    }

    const uploadedFilename = req.file.filename;
    
    // Perform restoration
    const result = await backupManager.restoreBackup(uploadedFilename);

    logActivity({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_BACKUP_RESTORE',
      details: `Uploaded and restored database from backup file "${uploadedFilename}"`,
      metadata: { filename: uploadedFilename, restoredAt: result.timestamp }
    });

    logAudit({
      req,
      userId: req.userData.userId,
      action: 'ADMIN_ACTION',
      details: `Uploaded and restored database from backup archive "${uploadedFilename}"`,
      metadata: { filename: uploadedFilename }
    });

    res.status(200).json({ message: 'Backup uploaded and database restored successfully', result });
  } catch (error) {
    // Clean up uploaded file if restoration fails
    if (req.file) {
      const filePath = path.join(backupManager.BACKUP_DIR, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SYSTEM SETTINGS & AUDIT LOGS (SUPER ADMIN ONLY)
// ==========================================

exports.getSystemConfig = async (req, res) => {
  try {
    const configs = await SystemConfig.find({});
    const configMap = {};
    configs.forEach(c => { configMap[c.key] = c.value; });
    res.status(200).json(configMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSystemConfig = async (req, res) => {
  try {
    const updates = req.body;
    const promises = Object.keys(updates).map(key => {
      return SystemConfig.findOneAndUpdate(
        { key },
        { value: updates[key] },
        { upsert: true, new: true }
      );
    });
    await Promise.all(promises);

    logAudit({
      req,
      userId: req.userData.userId,
      action: 'SYSTEM_CHANGE',
      details: 'Updated platform SMTP/API configurations',
      metadata: updates
    });

    res.status(200).json({ message: 'System configurations updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role, action } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (role && role !== 'all') {
      query.userRole = role;
    }
    if (action && action !== 'all') {
      query.action = action;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const AuditLog = require('../models/AuditLog');

    const [data, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        current: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
