const Tractor = require('../models/Tractor');
const { buildSearchQuery } = require('../utils/searchBuilder');
const asyncHandler = require('../utils/asyncHandler');

exports.createTractor = asyncHandler(async (req, res) => {
  const tractor = new Tractor({
    ...req.body,
    owner: req.userData.userId
  });
  await tractor.save();
  res.status(201).json(tractor);
});

exports.getTractors = asyncHandler(async (req, res) => {
  const { mongoQuery, pagination } = buildSearchQuery(req.query, 'ratePerHour');
  const { paginateQuery } = require('../utils/paginate');
  
  if (req.query.tractorType) {
    mongoQuery.tractorType = req.query.tractorType;
  }

  const result = await paginateQuery(Tractor, mongoQuery, pagination, {
    populate: { path: 'owner', select: 'name mobile profileImage verification' }
  });
  
  res.status(200).json(result);
});

exports.getTractorById = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findById(req.params.id).populate('owner', 'name mobile profileImage verification');
  if (!tractor) return res.status(404).json({ message: 'Tractor not found' });
  res.status(200).json(tractor);
});

exports.updateTractor = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findOneAndUpdate(
    { _id: req.params.id, owner: req.userData.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!tractor) return res.status(404).json({ message: 'Tractor not found or unauthorized' });
  res.status(200).json(tractor);
});

exports.deleteTractor = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findOneAndDelete({ _id: req.params.id, owner: req.userData.userId });
  if (!tractor) return res.status(404).json({ message: 'Tractor not found or unauthorized' });
  res.status(200).json({ message: 'Tractor deleted successfully' });
});
