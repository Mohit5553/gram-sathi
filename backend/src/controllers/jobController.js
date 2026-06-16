const LocalJob = require('../models/LocalJob');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/activityLogger');

// 1. Create a local job posting (Admins only)
exports.createJob = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can publish jobs' });
  }

  const job = new LocalJob({
    ...req.body
  });
  await job.save();

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'JOB_CREATE',
    details: `Published job: "${job.role}" at "${job.company}"`,
    metadata: { jobId: job._id, role: job.role, company: job.company }
  });

  res.status(201).json(job);
});

// 2. Get local jobs list (Public)
exports.getJobs = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };

  if (type) query.type = type;
  if (search) {
    query.$or = [
      { role: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') },
      { desc: new RegExp(search, 'i') }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [records, total] = await Promise.all([
    LocalJob.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    LocalJob.countDocuments(query)
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

// 3. Get job details by ID (Public)
exports.getJobById = asyncHandler(async (req, res) => {
  const job = await LocalJob.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.status(200).json(job);
});

// 4. Update a job posting (Admins only)
exports.updateJob = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can update jobs' });
  }

  const job = await LocalJob.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!job) return res.status(404).json({ message: 'Job not found' });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'JOB_UPDATE',
    details: `Updated job "${job.role}" at "${job.company}"`,
    metadata: { jobId: job._id }
  });

  res.status(200).json(job);
});

// 5. Delete a job posting (Admins only)
exports.deleteJob = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only admins can delete jobs' });
  }

  const job = await LocalJob.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  logActivity({
    req,
    userId: req.userData.userId,
    action: 'JOB_DELETE',
    details: `Deleted job: "${job.role}"`,
    metadata: { title: job.role }
  });

  res.status(200).json({ message: 'Job deleted successfully' });
});
