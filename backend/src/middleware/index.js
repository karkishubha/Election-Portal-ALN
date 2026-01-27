/**
 * Middleware Index
 * Nepal Election Portal
 */

const { protect, generateToken } = require('./auth');
const { notFound, errorHandler } = require('./errorHandler');

module.exports = {
  protect,
  generateToken,
  notFound,
  errorHandler,
};
