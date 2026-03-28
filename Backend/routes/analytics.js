/**
 * Analytics Routes
 * Endpoints for system analytics, reporting, and reach monitoring
 * Per SRS 4.4: Reach Analytics
 *
 * Base Path: /api/analytics
 *
 * Authentication: Required (JWT)
 * Authorization: Varies by endpoint (Admin, Teacher, Admin+Teacher, All Auth Users)
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const analyticsController = require('../controllers/analyticsController');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware: All analytics endpoints require authentication
router.use(authMiddleware);

// ============================================
// 8.1 VIDEO VIEWERSHIP ANALYTICS
// ============================================

/**
 * GET /api/analytics/videos
 * @desc Get most watched videos with detailed analytics
 * @access All Auth Users (Admin/Teacher/Student)
 * @query {String} classId - Filter by class (optional)
 * @query {String} subject - Filter by subject (optional)
 * @query {Number} limit - Results limit (default: 10, max: 100)
 * @query {Number} skip - Results offset (default: 0)
 * @returns {Object} { success, data: [videos], message }
 *          data[].title, subject, uploadedBy, views, completionRate, 
 *          totalViewers, completedViews, averageWatchPercentage
 */
router.get('/videos', (req, res) => {
  logger.info('GET /api/analytics/videos', {
    context: 'analytics.routes',
    userId: req.user._id,
    role: req.user.role,
    query: req.query,
  });
  analyticsController.getVideoAnalytics(req, res);
});

/**
 * GET /api/analytics/videos/:videoId
 * @desc Get detailed analytics for specific video
 * @access All Auth Users
 * @param {String} videoId - Video ObjectId
 * @returns {Object} { success, data: { videoId, title, views, uniqueViewers, 
 *          completionRate, averageWatchPercentage, totalWatchTime }, message }
 */
router.get('/videos/:videoId', (req, res) => {
  logger.info('GET /api/analytics/videos/:videoId', {
    context: 'analytics.routes',
    videoId: req.params.videoId,
    userId: req.user._id,
  });
  analyticsController.getVideoDetailAnalytics(req, res);
});

// ============================================
// 8.2 VIEWERSHIP TRENDS
// ============================================

/**
 * GET /api/analytics/viewership-trends
 * @desc Get viewership trends over time with charting data
 * @access Admin, Teacher
 * @query {String} granularity - 'day' | 'week' | 'month' (default: 'day')
 * @query {Number} days - Number of days to analyze (default: 30, max: 90)
 * @returns {Object} { success, data: [trends], message }
 *          data[].date, totalViews, newViewers, completedViews, 
 *          completionPercentage
 */
router.get('/viewership-trends', roleGuard(['admin', 'teacher']), (req, res) => {
  logger.info('GET /api/analytics/viewership-trends', {
    context: 'analytics.routes',
    userId: req.user._id,
    granularity: req.query.granularity,
    days: req.query.days,
  });
  analyticsController.getViewershipTrends(req, res);
});

/**
 * GET /api/analytics/peak-watch-times
 * @desc Get peak hours for video watching
 * @access Admin, Teacher
 * @returns {Object} { success, data: { peakHour, hourlyBreakdown }, message }
 *          peakHour: { hour, viewCount, viewerCount, averageViewsPerViewer }
 *          hourlyBreakdown: Array of hourly data
 */
router.get('/peak-watch-times', roleGuard(['admin', 'teacher']), (req, res) => {
  logger.info('GET /api/analytics/peak-watch-times', {
    context: 'analytics.routes',
    userId: req.user._id,
  });
  analyticsController.getPeakWatchTimes(req, res);
});

// ============================================
// 8.3 STUDENT ENGAGEMENT ANALYTICS
// ============================================

/**
 * GET /api/analytics/engagement
 * @desc Get overall student engagement metrics
 * @access Admin, Teacher
 * @returns {Object} { success, data: { totalActiveStudents, engagementByClass, 
 *          topEngagedStudents }, message }
 *          engagementByClass[].className, studentCount, totalViews, completionRate
 *          topEngagedStudents[].studentName, videosWatched, averageCompletion
 */
router.get('/engagement', roleGuard(['admin', 'teacher']), (req, res) => {
  logger.info('GET /api/analytics/engagement', {
    context: 'analytics.routes',
    userId: req.user._id,
  });
  analyticsController.getEngagementMetrics(req, res);
});

// ============================================
// 8.4 ATTENDANCE ANALYTICS
// ============================================

/**
 * GET /api/analytics/attendance
 * @desc Get attendance statistics and patterns
 * @access Admin, Teacher
 * @query {String} classId - Filter by class (optional)
 * @query {Number} days - Days to analyze (default: 30, max: 365)
 * @returns {Object} { success, data: { overallStats, byClass, chronicAbsentees }, message }
 *          overallStats.overallAttendancePercentage, totalPresent, totalAbsent
 *          chronicAbsentees[].studentName, attendancePercentage (< 75%)
 */
router.get('/attendance', roleGuard(['admin', 'teacher']), (req, res) => {
  logger.info('GET /api/analytics/attendance', {
    context: 'analytics.routes',
    userId: req.user._id,
    classId: req.query.classId,
  });
  analyticsController.getAttendanceAnalytics(req, res);
});

// ============================================
// 8.5 FINANCIAL ANALYTICS
// ============================================

/**
 * GET /api/analytics/revenue
 * @desc Get revenue and financial analytics
 * @access Admin only
 * @returns {Object} { success, data: { totalRevenue, paymentsByMethod, 
 *          paymentTrends, pendingFees }, message }
 * @note Awaiting Payment model and endpoints from Phase 7 (Arpit)
 */
router.get('/revenue', roleGuard(['admin']), (req, res) => {
  logger.info('GET /api/analytics/revenue', {
    context: 'analytics.routes',
    userId: req.user._id,
  });
  analyticsController.getRevenueAnalytics(req, res);
});

// ============================================
// 8.7 REPORT GENERATION
// ============================================

/**
 * GET /api/analytics/reports
 * @desc List available report types and their specifications
 * @access All Auth Users
 * @returns {Object} { success, data: [reportTypes], message }
 *          reportTypes[].id, name, description, fields, access
 */
router.get('/reports', (req, res) => {
  logger.info('GET /api/analytics/reports', {
    context: 'analytics.routes',
    userId: req.user._id,
  });
  analyticsController.listReportTypes(req, res);
});

/**
 * GET /api/analytics/reports/:type
 * @desc Generate comprehensive analytics reports
 * @access Admin, Teacher
 * @param {String} type - Report type: 'video', 'engagement', 'attendance', 'comprehensive'
 * @query {String} period - Period: 'last30days', 'last90days', 'custom' (default: 'last30days')
 * @query {Number} days - Custom days range (default: 30, max: 90)
 * @query {String} format - 'json' | 'pdf' (default: 'json', pdf coming soon)
 * @returns {Object} { success, data: { type, title, generatedAt, data, 
 *          requestedBy, format, downloadUrl }, message }
 */
router.get('/reports/:type', roleGuard(['admin', 'teacher']), (req, res) => {
  logger.info('GET /api/analytics/reports/:type', {
    context: 'analytics.routes',
    reportType: req.params.type,
    userId: req.user._id,
    period: req.query.period,
    format: req.query.format,
  });
  analyticsController.generateReport(req, res);
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler for undefined routes
router.use((req, res) => {
  logger.warn('404 - Analytics endpoint not found', {
    context: 'analytics.routes',
    method: req.method,
    path: req.path,
    userId: req.user._id,
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Analytics endpoint not found: ${req.method} ${req.path}`,
    },
  });
});

module.exports = router;
