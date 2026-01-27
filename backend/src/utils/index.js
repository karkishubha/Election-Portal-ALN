/**
 * Utils Index
 * Nepal Election Portal
 */

const { uploadPDF, getFileUrl, deleteFile } = require('./upload');
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  getPagination,
  buildPaginationMeta,
} = require('./response');

module.exports = {
  uploadPDF,
  getFileUrl,
  deleteFile,
  successResponse,
  paginatedResponse,
  errorResponse,
  getPagination,
  buildPaginationMeta,
};
