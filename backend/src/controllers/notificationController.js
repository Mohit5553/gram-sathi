const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { paginateQuery } = require('../utils/paginate');

exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const result = await paginateQuery(
    Notification,
    { user: req.userData.userId },
    { skip: (page - 1) * limit, limit, page },
    { sort: { createdAt: -1 } }
  );

  res.status(200).json(result);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.userData.userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.status(200).json(notification);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.userData.userId, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ message: 'All notifications marked as read' });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ 
    _id: req.params.id, 
    user: req.userData.userId 
  });

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.status(200).json({ message: 'Notification deleted successfully' });
});
