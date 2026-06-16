const LostFound = require('../models/LostFound');
const NotificationService = require('../services/NotificationService');
const { buildSearchQuery } = require('../utils/searchBuilder');
const { paginateQuery } = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');

exports.createReport = asyncHandler(async (req, res) => {
  const report = new LostFound({
    ...req.body,
    user: req.userData.userId
  });
  await report.save();

  const io = req.app.get('io');
  await NotificationService.broadcast({
    io,
    title: `New ${report.type} Item`,
    message: `A new ${report.type} item "${report.title}" has been reported.`,
    type: 'alert',
    topic: 'lost_found'
  });

  res.status(201).json(report);
});

exports.getReports = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const baseStatus = status || 'open';
  
  const { mongoQuery, pagination } = buildSearchQuery(req.query, null, baseStatus);
  
  if (type) mongoQuery.type = type;

  const result = await paginateQuery(LostFound, mongoQuery, pagination);
  res.status(200).json(result);
});

exports.getReportById = asyncHandler(async (req, res) => {
  const report = await LostFound.findById(req.params.id).populate('user', 'name email');
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.status(200).json(report);
});

exports.updateReport = asyncHandler(async (req, res) => {
  const report = await LostFound.findOneAndUpdate(
    { _id: req.params.id, user: req.userData.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!report) return res.status(404).json({ message: 'Report not found or unauthorized' });
  res.status(200).json(report);
});

exports.deleteReport = asyncHandler(async (req, res) => {
  const report = await LostFound.findOneAndDelete({ _id: req.params.id, user: req.userData.userId });
  if (!report) return res.status(404).json({ message: 'Report not found or unauthorized' });
  res.status(200).json({ message: 'Report deleted successfully' });
});
