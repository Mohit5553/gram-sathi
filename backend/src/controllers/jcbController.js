const JCB = require('../models/JCB');
const { buildSearchQuery } = require('../utils/searchBuilder');
const asyncHandler = require('../utils/asyncHandler');

exports.createJCB = asyncHandler(async (req, res) => {
  const jcb = new JCB({
    ...req.body,
    owner: req.userData.userId
  });
  await jcb.save();
  res.status(201).json(jcb);
});

exports.getJCBs = asyncHandler(async (req, res) => {
  const { mongoQuery, pagination } = buildSearchQuery(req.query, 'ratePerHour');
  const { paginateQuery } = require('../utils/paginate');
  
  const result = await paginateQuery(JCB, mongoQuery, pagination, {
    populate: { path: 'owner', select: 'name mobile profileImage verification' }
  });
  
  res.status(200).json(result);
});

exports.getJCBById = asyncHandler(async (req, res) => {
  const jcb = await JCB.findById(req.params.id).populate('owner', 'name mobile profileImage verification');
  if (!jcb) return res.status(404).json({ message: 'JCB not found' });
  res.status(200).json(jcb);
});

exports.updateJCB = asyncHandler(async (req, res) => {
  const jcb = await JCB.findOneAndUpdate(
    { _id: req.params.id, owner: req.userData.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!jcb) return res.status(404).json({ message: 'JCB not found or unauthorized' });
  res.status(200).json(jcb);
});

exports.deleteJCB = asyncHandler(async (req, res) => {
  const jcb = await JCB.findOneAndDelete({ _id: req.params.id, owner: req.userData.userId });
  if (!jcb) return res.status(404).json({ message: 'JCB not found or unauthorized' });
  res.status(200).json({ message: 'JCB deleted successfully' });
});
