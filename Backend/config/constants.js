/**
 * System Constants
 * Application-wide constants and enumerations
 * Per SRS 2.3: User Classes and Their Characteristics
 */

const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
  teacher: ['read', 'write', 'manage_class', 'upload_videos', 'mark_attendance'],
  student: ['read', 'view_videos', 'pay_fees', 'view_attendance'],
};

const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
};

const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
};

const NOTIFICATION_TYPES = {
  PAYMENT: 'payment',
  ATTENDANCE: 'attendance',
  EVENT: 'event',
  SYSTEM: 'system',
  VIDEO: 'video',
};

const EVENT_RSVP_STATUS = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe',
};

const VIDEO_FORMATS = {
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  MKV: 'video/x-matroska',
};

const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

const FILE_SIZES = {
  MAX_VIDEO_SIZE_MB: 500,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_DOCUMENT_SIZE_MB: 50,
};

const AZURE_SETTINGS = {
  VIDEO_CONTAINER: 'videos',
  IMAGE_CONTAINER: 'images',
  SAS_URL_EXPIRY_MINUTES: 15,
};

const ATTENDANCE_THRESHOLDS = {
  LOW_ATTENDANCE_PERCENTAGE: 75,
  CHRONIC_ABSENTEE_PERCENTAGE: 60,
};

const JWT_SETTINGS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_RESET_TOKEN_EXPIRY: '1h',
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  ATTENDANCE_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  NOTIFICATION_TYPES,
  EVENT_RSVP_STATUS,
  VIDEO_FORMATS,
  ERROR_CODES,
  HTTP_STATUS,
  PAGINATION_DEFAULTS,
  FILE_SIZES,
  AZURE_SETTINGS,
  ATTENDANCE_THRESHOLDS,
  JWT_SETTINGS,
};
