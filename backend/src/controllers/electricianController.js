const Electrician = require('../models/Electrician');
const { buildSearchQuery } = require('../utils/searchBuilder');
const asyncHandler = require('../utils/asyncHandler');

exports.createElectrician = asyncHandler(async (req, res) => {
  const electrician = new Electrician({ ...req.body, user: req.userData.userId });
  await electrician.save();
  res.status(201).json(electrician);
});

exports.getElectricians = asyncHandler(async (req, res) => {
  const { mongoQuery, pagination } = buildSearchQuery(req.query, 'visitCharge');
  const { paginateQuery } = require('../utils/paginate');

  const result = await paginateQuery(Electrician, mongoQuery, pagination, {
    populate: { path: 'user', select: 'name mobile profileImage verification' }
  });
  
  res.status(200).json(result);
});

exports.getElectricianById = asyncHandler(async (req, res) => {
  const electrician = await Electrician.findById(req.params.id).populate('user', 'name mobile profileImage verification');
  if (!electrician) return res.status(404).json({ message: 'Electrician not found' });
  res.status(200).json(electrician);
});

exports.updateElectrician = asyncHandler(async (req, res) => {
  const electrician = await Electrician.findOneAndUpdate(
    { _id: req.params.id, user: req.userData.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!electrician) return res.status(404).json({ message: 'Not found or unauthorized' });
  res.status(200).json(electrician);
});

exports.deleteElectrician = asyncHandler(async (req, res) => {
  const electrician = await Electrician.findOneAndDelete({ _id: req.params.id, user: req.userData.userId });
  if (!electrician) return res.status(404).json({ message: 'Not found or unauthorized' });
  res.status(200).json({ message: 'Deleted successfully' });
});
