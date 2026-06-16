/**
 * Builds a standardized MongoDB query object for advanced searching across service modules.
 * @param {Object} query - The req.query object from Express
 * @param {String} priceField - The name of the field representing price ('ratePerHour' or 'dailyRate')
 * @returns {Object} { mongoQuery, pagination: { skip, limit, page } }
 */
exports.buildSearchQuery = (query, priceField = 'ratePerHour', baseStatus = 'approved') => {
  const { state, district, block, village, isAvailable, minPrice, maxPrice, minRating, search, page = 1, limit = 10 } = query;
  let mongoQuery = {};
  if (baseStatus) mongoQuery.status = baseStatus;

  if (search) {
    mongoQuery.$text = { $search: search };
  }

  if (state) {
    mongoQuery.state = { $regex: state, $options: 'i' };
  }

  if (district) {
    mongoQuery.district = { $regex: district, $options: 'i' };
  }

  if (block) {
    mongoQuery.block = { $regex: block, $options: 'i' };
  }

  if (village) {
    mongoQuery.village = { $regex: village, $options: 'i' };
  }

  if (isAvailable !== undefined && isAvailable !== '') {
    mongoQuery.isAvailable = isAvailable === 'true';
  }

  if (minPrice || maxPrice) {
    mongoQuery[priceField] = {};
    if (minPrice) mongoQuery[priceField].$gte = Number(minPrice);
    if (maxPrice) mongoQuery[priceField].$lte = Number(maxPrice);
  }

  if (minRating) {
    mongoQuery.rating = { $gte: Number(minRating) };
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  return {
    mongoQuery,
    pagination: { skip, limit: limitNumber, page: pageNumber }
  };
};
