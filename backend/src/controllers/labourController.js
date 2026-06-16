const Labour = require('../models/Labour');
const { buildSearchQuery } = require('../utils/searchBuilder');
const asyncHandler = require('../utils/asyncHandler');

exports.createLabour = asyncHandler(async (req, res) => {
  const labour = new Labour({
    ...req.body,
    user: req.userData.userId
  });
  await labour.save();
  res.status(201).json(labour);
});

exports.getLabours = asyncHandler(async (req, res) => {
  const { mongoQuery, pagination } = buildSearchQuery(req.query, 'dailyRate');
  const { paginateQuery } = require('../utils/paginate');
  
  if (req.query.skillType) {
    mongoQuery.skillType = req.query.skillType;
  }
  
  const result = await paginateQuery(Labour, mongoQuery, pagination, {
    populate: { path: 'user', select: 'name mobile profileImage verification' }
  });
  
  res.status(200).json(result);
});

exports.getLabourById = asyncHandler(async (req, res) => {
  const labour = await Labour.findById(req.params.id).populate('user', 'name mobile profileImage verification');
  if (!labour) return res.status(404).json({ message: 'Labour not found' });
  res.status(200).json(labour);
});

exports.updateLabour = asyncHandler(async (req, res) => {
  const labour = await Labour.findOneAndUpdate(
    { _id: req.params.id, user: req.userData.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!labour) return res.status(404).json({ message: 'Labour not found or unauthorized' });
  res.status(200).json(labour);
});

exports.deleteLabour = asyncHandler(async (req, res) => {
  const labour = await Labour.findOneAndDelete({ _id: req.params.id, user: req.userData.userId });
  if (!labour) return res.status(404).json({ message: 'Labour not found or unauthorized' });
  res.status(200).json({ message: 'Labour deleted successfully' });
});
