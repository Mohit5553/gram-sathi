/**
 * Async handler to wrap controller functions and pass errors to Express Next function
 * Eliminates the need for manual try-catch blocks
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
