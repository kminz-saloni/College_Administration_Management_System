/**
 * Response Utilities
 * Consistent success and error response envelopes
 * Per Backend_Handoff.md Section 1: Non-Negotiable Backend Contracts
 */

/**
 * Success Response Envelope
 * @param {object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response Envelope
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {string} code - Error code (VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, etc.)
 * @param {array} details - Array of error details (optional)
 * @param {number} statusCode - HTTP status code (default: 400)
 */
const sendError = (
  res,
  message = 'An error occurred',
  code = 'INTERNAL_ERROR',
  details = [],
  statusCode = 400
) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
};

/**
 * Pagination Metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Paginated Success Response
 * @param {object} res - Express response object
 * @param {array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @param {string} message - Optional message
 * @param {number} statusCode - HTTP status code
 */
const sendPaginatedSuccess = (
  res,
  items,
  page,
  limit,
  total,
  message = 'Success',
  statusCode = 200
) => {
  const pagination = getPaginationMeta(page, limit, total);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  getPaginationMeta,
  sendPaginatedSuccess,
};
