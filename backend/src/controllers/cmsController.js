const CMSContent = require('../models/CMSContent');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');

// Create a new CMS Content item
exports.createCMSContent = asyncHandler(async (req, res) => {
  if (req.userData?.role !== 'admin' && req.userData?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can create CMS content' });
  }

  const { title, content, contentType, imageUrl, link, expiryDate, isActive, village, author } = req.body;

  if (!title || !contentType) {
    return res.status(400).json({ message: 'Title and content type are required' });
  }

  const cmsItem = new CMSContent({
    title,
    content,
    contentType,
    imageUrl,
    link,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    isActive: isActive !== undefined ? isActive : true,
    village,
    author: author || 'Admin'
  });

  await cmsItem.save();

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'CMS_CONTENT_CREATE',
    details: `Created CMS content "${title}" of type ${contentType}`,
    metadata: { cmsId: cmsItem._id, contentType, title }
  });

  res.status(201).json(cmsItem);
});

// Retrieve CMS Content list
exports.getCMSContent = asyncHandler(async (req, res) => {
  const { type, village, limit = 50, page = 1 } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  // Filter by content type if provided
  if (type) {
    query.contentType = type;
  }

  // Filter by village if provided (specifically for local notices/news)
  // Support matching the specific village or notice with no village (broadcast to all)
  if (village) {
    query.$or = [
      { village: village },
      { village: { $exists: false } },
      { village: '' },
      { village: null }
    ];
  }

  // For non-admin users, restrict query to active and unexpired items
  const isAdmin = req.userData?.role === 'admin' || req.userData?.role === 'super_admin';
  if (!isAdmin) {
    query.isActive = true;
    query.$and = [
      {
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gt: new Date() } }
        ]
      }
    ];
  }

  const [data, total] = await Promise.all([
    CMSContent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    CMSContent.countDocuments(query)
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
});

// Retrieve a single CMS item by ID
exports.getCMSContentById = asyncHandler(async (req, res) => {
  const cmsItem = await CMSContent.findById(req.params.id);
  
  if (!cmsItem) {
    return res.status(404).json({ message: 'CMS content item not found' });
  }

  // Protect draft/expired content from non-admin users
  const isAdmin = req.userData?.role === 'admin' || req.userData?.role === 'super_admin';
  const isExpired = cmsItem.expiryDate && new Date(cmsItem.expiryDate) <= new Date();
  
  if (!isAdmin && (!cmsItem.isActive || isExpired)) {
    return res.status(404).json({ message: 'CMS content item not found' });
  }

  res.status(200).json(cmsItem);
});

// Update an existing CMS item
exports.updateCMSContent = asyncHandler(async (req, res) => {
  if (req.userData?.role !== 'admin' && req.userData?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can update CMS content' });
  }

  const { title, content, contentType, imageUrl, link, expiryDate, isActive, village, author } = req.body;

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (content !== undefined) updateFields.content = content;
  if (contentType !== undefined) updateFields.contentType = contentType;
  if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
  if (link !== undefined) updateFields.link = link;
  if (expiryDate !== undefined) updateFields.expiryDate = expiryDate ? new Date(expiryDate) : null;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (village !== undefined) updateFields.village = village;
  if (author !== undefined) updateFields.author = author;

  const cmsItem = await CMSContent.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!cmsItem) {
    return res.status(404).json({ message: 'CMS content item not found' });
  }

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'CMS_CONTENT_UPDATE',
    details: `Updated CMS content "${cmsItem.title}"`,
    metadata: { cmsId: cmsItem._id, title: cmsItem.title, contentType: cmsItem.contentType }
  });

  res.status(200).json(cmsItem);
});

// Delete a CMS item
exports.deleteCMSContent = asyncHandler(async (req, res) => {
  if (req.userData?.role !== 'admin' && req.userData?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can delete CMS content' });
  }

  const cmsItem = await CMSContent.findByIdAndDelete(req.params.id);

  if (!cmsItem) {
    return res.status(404).json({ message: 'CMS content item not found' });
  }

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'CMS_CONTENT_DELETE',
    details: `Deleted CMS content "${cmsItem.title}"`,
    metadata: { cmsId: cmsItem._id, title: cmsItem.title, contentType: cmsItem.contentType }
  });

  res.status(200).json({ message: 'CMS content item deleted successfully' });
});
