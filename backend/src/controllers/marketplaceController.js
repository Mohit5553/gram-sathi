const MarketplaceListing = require('../models/MarketplaceListing');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');

// 1. Create a marketplace listing (Authenticated users)
exports.createListing = asyncHandler(async (req, res) => {
  const listing = new MarketplaceListing({
    ...req.body,
    userId: req.userData.userId
  });
  await listing.save();

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'MARKETPLACE_CREATE',
    details: `Published marketplace listing "${listing.title}" for ₹${listing.price}`,
    metadata: { listingId: listing._id, title: listing.title, price: listing.price }
  });

  res.status(201).json(listing);
});

// 2. Get listings with filters (Public)
exports.getListings = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };

  if (category && category !== 'All') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [records, total] = await Promise.all([
    MarketplaceListing.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    MarketplaceListing.countDocuments(query)
  ]);

  res.status(200).json({
    data: records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// 3. Get listing by ID (Public)
exports.getListingById = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id).populate('userId', 'name email');
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.status(200).json(listing);
});

// 4. Update a listing (Owner or Admin)
exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  // Only the owner or an admin can update
  if (listing.userId.toString() !== req.userData.userId && req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized modification' });
  }

  Object.assign(listing, req.body);
  await listing.save();

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'MARKETPLACE_UPDATE',
    details: `Updated listing "${listing.title}"`,
    metadata: { listingId: listing._id }
  });

  res.status(200).json(listing);
});

// 5. Delete a listing (Owner or Admin)
exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  // Only the owner or an admin can delete
  if (listing.userId.toString() !== req.userData.userId && req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Unauthorized deletion' });
  }

  await MarketplaceListing.findByIdAndDelete(req.params.id);

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'MARKETPLACE_DELETE',
    details: `Deleted listing "${listing.title}"`,
    metadata: { title: listing.title }
  });

  res.status(200).json({ message: 'Listing deleted successfully' });
});
