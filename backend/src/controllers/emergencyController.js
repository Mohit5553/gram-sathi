const EmergencyContact = require('../models/EmergencyContact');
const { buildSearchQuery } = require('../utils/searchBuilder');
const { paginateQuery } = require('../utils/paginate');
const asyncHandler = require('../utils/asyncHandler');

exports.createContact = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') return res.status(403).json({ message: 'Admin only' });
  const contact = new EmergencyContact(req.body);
  await contact.save();
  res.status(201).json(contact);
});

exports.getContacts = asyncHandler(async (req, res) => {
  const { category, village } = req.query;
  const { mongoQuery, pagination } = buildSearchQuery(req.query, null, 'active');
  
  if (category && category !== 'All') mongoQuery.category = category;
  
  const result = await paginateQuery(EmergencyContact, mongoQuery, pagination, { sort: { category: 1, name: 1 } });
  res.status(200).json(result);
});

exports.updateContact = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') return res.status(403).json({ message: 'Admin only' });
  const contact = await EmergencyContact.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!contact) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(contact);
});

exports.deleteContact = asyncHandler(async (req, res) => {
  if (req.userData.role !== 'admin' && req.userData.role !== 'super_admin') return res.status(403).json({ message: 'Admin only' });
  const contact = await EmergencyContact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ message: 'Not found' });
  res.status(200).json({ message: 'Deleted' });
});
