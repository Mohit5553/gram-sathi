/**
 * Standard utility for executing paginated MongoDB queries
 * @param {Model} model - Mongoose Model
 * @param {Object} query - MongoDB query filter object
 * @param {Object} paginationConfig - Config containing { skip, limit, page }
 * @param {Object} options - Additional options like populate or sort
 * @returns {Promise<Object>} { data: [...], pagination: { total, pages, current, limit } }
 */
exports.paginateQuery = async (model, query, paginationConfig, options = {}) => {
  const { skip, limit, page } = paginationConfig;
  const { populate, sort = { createdAt: -1 } } = options;

  let baseQuery = model.find(query).sort(sort).skip(skip).limit(limit);

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(p => { baseQuery = baseQuery.populate(p); });
    } else {
      baseQuery = baseQuery.populate(populate);
    }
  }

  const [data, total] = await Promise.all([
    baseQuery.lean(),
    model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      limit
    }
  };
};
