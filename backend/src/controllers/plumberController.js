const Plumber = require('../models/Plumber');
const { buildSearchQuery } = require('../utils/searchBuilder');
const asyncHandler = require('../utils/asyncHandler');

exports.createPlumber = asyncHandler(async (req, res) => {
  const plumber = new Plumber({ ...req.body, user: req.userData.userId });
  await plumber.save();
  res.status(201).json(plumber);
});

exports.getPlumbers = asyncHandler(async (req, res) => {
  const { mongoQuery, pagination } = buildSearchQuery(req.query, 'visitCharge');
  const { paginateQuery } = require('../utils/paginate');

  const result = await paginateQuery(Plumber, mongoQuery, pagination, {
    populate: { path: 'user', select: 'name mobile profileImage verification' }
  });
  
  res.status(200).json(result);
});

exports.getPlumberById = asyncHandler(async (req, res) => {
  const plumber = await Plumber.findById(req.params.id).populate('user', 'name mobile profileImage verification');
  if (!plumber) return res.status(404).json({ message: 'Plumber not found' });
  res.status(200).json(plumber);
});

exports.updatePlumber = asyncHandler(async (req, res) => {
  const plumber = await Plumber.findOneAndUpdate(
    { _id: req.params.id, user: req.userData.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!plumber) return res.status(404).json({ message: 'Not found or unauthorized' });
  res.status(200).json(plumber);
});

exports.deletePlumber = asyncHandler(async (req, res) => {
  const plumber = await Plumber.findOneAndDelete({ _id: req.params.id, user: req.userData.userId });
  if (!plumber) return res.status(404).json({ message: 'Not found or unauthorized' });
  res.status(200).json({ message: 'Deleted successfully' });
});
