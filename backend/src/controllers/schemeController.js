const GovernmentScheme = require('../models/GovernmentScheme');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const { buildSearchQuery } = require('../utils/searchBuilder');
const { paginateQuery } = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');

exports.createScheme = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can create schemes' });
  }
  const scheme = new GovernmentScheme(req.body);
  await scheme.save();

  // Persist notifications for all users so it appears in their history log
  const Notification = require('../models/Notification');
  const users = await User.find({}).select('_id');
  if (users.length > 0) {
    const notifications = users.map(u => ({
      user: u._id,
      title: 'New Government Scheme',
      message: `A new scheme "${scheme.title}" has been added.`,
      type: 'scheme'
    }));
    await Notification.insertMany(notifications);
  }

  const io = req.app.get('io');
  await NotificationService.broadcast({
    io,
    title: 'New Government Scheme',
    message: `A new scheme "${scheme.title}" has been added.`,
    type: 'scheme',
    topic: 'schemes'
  });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'SCHEME_CREATE',
    details: `Created government scheme "${scheme.title}"`,
    metadata: { schemeId: scheme._id, title: scheme.title }
  });

  res.status(201).json(scheme);
});

exports.getSchemes = asyncHandler(async (req, res) => {
  const { department, status } = req.query;
  const baseStatus = (!req.userData || (req.userData.role !== 'admin' && req.userData.role !== 'super_admin')) ? 'active' : (status || null);
  
  const { mongoQuery, pagination } = buildSearchQuery(req.query, null, baseStatus);
  
  if (department) mongoQuery.department = department;
  if (req.query.featured === 'true') mongoQuery.isFeatured = true;

  const result = await paginateQuery(GovernmentScheme, mongoQuery, pagination);
  res.status(200).json(result);
});

exports.getSchemeById = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findById(req.params.id);
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
  res.status(200).json(scheme);
});

exports.updateScheme = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can update schemes' });
  }
  const scheme = await GovernmentScheme.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'SCHEME_UPDATE',
    details: `Updated government scheme "${scheme.title}"`,
    metadata: { schemeId: scheme._id, title: scheme.title }
  });

  res.status(200).json(scheme);
});

exports.deleteScheme = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can delete schemes' });
  }
  const scheme = await GovernmentScheme.findByIdAndDelete(req.params.id);
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'SCHEME_DELETE',
    details: `Deleted government scheme "${scheme.title}"`,
    metadata: { schemeId: scheme._id, title: scheme.title }
  });

  res.status(200).json({ message: 'Scheme deleted successfully' });
});

exports.toggleBookmark = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userData.userId);
  const schemeId = req.params.id;
  
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isBookmarked = user.bookmarkedSchemes.includes(schemeId);
  
  if (isBookmarked) {
    user.bookmarkedSchemes = user.bookmarkedSchemes.filter(id => id.toString() !== schemeId);
  } else {
    user.bookmarkedSchemes.push(schemeId);
  }
  
  await user.save();
  
  res.status(200).json({ 
    message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
    bookmarkedSchemes: user.bookmarkedSchemes 
  });
});

exports.getBookmarkedSchemes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userData.userId).populate('bookmarkedSchemes');
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  res.status(200).json(user.bookmarkedSchemes);
});
