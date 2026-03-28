/**
 * Analytics Service
 * Aggregations and calculations for system analytics
 * Per SRS 4.4: Reach Analytics - track student interactions and generate reports
 */

const Video = require('../models/Video');
const VideoWatchProgress = require('../models/VideoWatchProgress');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Class = require('../models/Class');
const logger = require('../utils/logger');

// ============================================
// 8.1 VIDEO VIEWERSHIP ANALYTICS
// ============================================

/**
 * Get most watched videos with detailed analytics
 * @param {Object} options - Filter options { classId, subject, limit, skip }
 * @returns {Promise<Array>} Most watched videos with view counts
 */
const getMostWatchedVideos = async (options = {}) => {
  try {
    const { classId, subject, limit = 10, skip = 0 } = options;

    const pipeline = [
      // Match active videos only
      {
        $match: {
          isActive: true,
          isDeleted: false,
          ...(classId && { classId: new (require('mongoose').Types.ObjectId)(classId) }),
          ...(subject && { subject: subject }),
        },
      },

      // Group by video and aggregate views
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          subject: { $first: '$subject' },
          uploadedBy: { $first: '$uploadedBy' },
          teacherName: { $first: '$teacherName' },
          classId: { $first: '$classId' },
          className: { $first: '$className' },
          views: { $first: '$views' },
          completionRate: { $first: '$completionRate' },
          createdAt: { $first: '$createdAt' },
        },
      },

      // Sort by views descending
      { $sort: { views: -1 } },

      // Pagination
      { $skip: skip },
      { $limit: limit },

      // Lookup watch progress for detailed stats
      {
        $lookup: {
          from: 'video_watch_progress',
          localField: '_id',
          foreignField: 'videoId',
          as: 'watchStats',
        },
      },

      // Add computed fields
      {
        $addFields: {
          totalViewers: { $size: '$watchStats' },
          completedViews: {
            $size: {
              $filter: {
                input: '$watchStats',
                as: 'stat',
                cond: { $eq: ['$$stat.isCompleted', true] },
              },
            },
          },
          averageWatchPercentage: {
            $avg: '$watchStats.completionPercentage',
          },
        },
      },

      // Remove watchStats for response
      {
        $project: {
          _id: 1,
          title: 1,
          subject: 1,
          uploadedBy: 1,
          teacherName: 1,
          classId: 1,
          className: 1,
          views: 1,
          completionRate: 1,
          totalViewers: 1,
          completedViews: 1,
          averageWatchPercentage: { $round: ['$averageWatchPercentage', 2] },
          createdAt: 1,
        },
      },
    ];

    const videos = await Video.aggregate(pipeline).exec();
    logger.info(`Retrieved ${videos.length} most watched videos`, {
      context: 'analyticsService::getMostWatchedVideos',
      count: videos.length,
    });

    return videos;
  } catch (error) {
    logger.error('Error fetching most watched videos', {
      context: 'analyticsService::getMostWatchedVideos',
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get detailed analytics for specific video
 * @param {String} videoId - Video ObjectId
 * @returns {Promise<Object>} Detailed video analytics
 */
const getVideoDetailAnalytics = async (videoId) => {
  try {
    const ObjectId = require('mongoose').Types.ObjectId;

    // Get video details
    const video = await Video.findById(videoId).lean();
    if (!video) {
      throw new Error('Video not found');
    }

    // Get watch progress aggregation
    const watchStats = await VideoWatchProgress.aggregate([
      {
        $match: {
          videoId: new ObjectId(videoId),
        },
      },
      {
        $group: {
          _id: '$videoId',
          totalViews: { $sum: '$numberOfViews' },
          uniqueViewers: { $sum: 1 },
          completedCount: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
          averageWatchPercentage: { $avg: '$completionPercentage' },
          averageWatchTime: { $avg: '$watchedDuration' },
          totalWatchTime: { $sum: '$watchedDuration' },
        },
      },
      {
        $project: {
          _id: 0,
          totalViews: 1,
          uniqueViewers: 1,
          completedCount: 1,
          completionRate: {
            $round: [{ $divide: ['$completedCount', '$uniqueViewers'] }, 2],
          },
          averageWatchPercentage: { $round: ['$averageWatchPercentage', 2] },
          averageWatchTime: { $round: ['$averageWatchTime', 2] },
          totalWatchTime: 1,
        },
      },
    ]).exec();

    const stats = watchStats.length > 0 ? watchStats[0] : {
      totalViews: 0,
      uniqueViewers: 0,
      completedCount: 0,
      completionRate: 0,
      averageWatchPercentage: 0,
      averageWatchTime: 0,
      totalWatchTime: 0,
    };

    logger.info(`Retrieved analytics for video ${videoId}`, {
      context: 'analyticsService::getVideoDetailAnalytics',
    });

    return {
      videoId,
      title: video.title,
      subject: video.subject,
      uploadedBy: video.uploadedBy,
      teacherName: video.teacherName,
      totalViews: stats.totalViews,
      uniqueViewers: stats.uniqueViewers,
      completedCount: stats.completedCount,
      completionRate: stats.completionRate,
      averageWatchPercentage: stats.averageWatchPercentage,
      averageWatchTime: stats.averageWatchTime,
      totalWatchTime: stats.totalWatchTime,
    };
  } catch (error) {
    logger.error('Error fetching video detail analytics', {
      context: 'analyticsService::getVideoDetailAnalytics',
      videoId,
      error: error.message,
    });
    throw error;
  }
};

// ============================================
// 8.2 VIEWERSHIP TRENDS
// ============================================

/**
 * Get viewership trends over time (daily/weekly/monthly)
 * @param {Object} options - { granularity: 'day'|'week'|'month', days: 30 }
 * @returns {Promise<Array>} Trend data for charting
 */
const getViewershipTrends = async (options = {}) => {
  try {
    const { granularity = 'day', days = 30 } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let dateFormat;
    switch (granularity) {
      case 'week':
        dateFormat = '%Y-W%V'; // Year-Week
        break;
      case 'month':
        dateFormat = '%Y-%m'; // Year-Month
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d'; // Year-Month-Day
    }

    const trends = await VideoWatchProgress.aggregate([
      {
        $match: {
          lastWatchedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$lastWatchedAt',
            },
          },
          totalViews: { $sum: '$numberOfViews' },
          newViewers: { $sum: 1 },
          completedViews: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: '$_id',
          _id: 0,
          totalViews: 1,
          newViewers: 1,
          completedViews: 1,
          completionPercentage: {
            $round: [{ $multiply: [{ $divide: ['$completedViews', '$newViewers'] }, 100] }, 2],
          },
        },
      },
    ]).exec();

    logger.info(`Retrieved viewership trends (${granularity})`, {
      context: 'analyticsService::getViewershipTrends',
      dataPoints: trends.length,
    });

    return trends;
  } catch (error) {
    logger.error('Error fetching viewership trends', {
      context: 'analyticsService::getViewershipTrends',
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get peak watch times analysis
 * @returns {Promise<Object>} Peak hours and times
 */
const getPeakWatchTimes = async () => {
  try {
    const peakHours = await VideoWatchProgress.aggregate([
      {
        $group: {
          _id: {
            $hour: '$lastWatchedAt',
          },
          viewCount: { $sum: '$numberOfViews' },
          viewerCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          hour: '$_id',
          _id: 0,
          viewCount: 1,
          viewerCount: 1,
          averageViewsPerViewer: {
            $round: [{ $divide: ['$viewCount', '$viewerCount'] }, 2],
          },
        },
      },
    ]).exec();

    // Find peak hour
    const peakHour = peakHours.reduce(
      (max, current) => (current.viewCount > max.viewCount ? current : max),
      peakHours[0] || {}
    );

    logger.info('Retrieved peak watch times', {
      context: 'analyticsService::getPeakWatchTimes',
    });

    return { peakHour, hourlyBreakdown: peakHours };
  } catch (error) {
    logger.error('Error fetching peak watch times', {
      context: 'analyticsService::getPeakWatchTimes',
      error: error.message,
    });
    throw error;
  }
};

// ============================================
// 8.3 STUDENT ENGAGEMENT ANALYTICS
// ============================================

/**
 * Get overall student engagement metrics
 * @returns {Promise<Object>} Engagement statistics
 */
const getEngagementMetrics = async () => {
  try {
    const ObjectId = require('mongoose').Types.ObjectId;

    // Get total active students
    const activeStudents = await VideoWatchProgress.aggregate([
      {
        $group: {
          _id: '$studentId',
        },
      },
      {
        $count: 'total',
      },
    ]).exec();

    // Get engagement by class
    const engagementByClass = await VideoWatchProgress.aggregate([
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $unwind: {
          path: '$classInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$classId',
          className: { $first: '$classInfo.name' },
          studentCount: { $sum: 1 },
          totalViews: { $sum: '$numberOfViews' },
          completedViews: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
          averageCompletion: { $avg: '$completionPercentage' },
        },
      },
      {
        $sort: { totalViews: -1 },
      },
      {
        $project: {
          className: 1,
          studentCount: 1,
          totalViews: 1,
          completedViews: 1,
          completionRate: {
            $round: [{ $divide: ['$completedViews', '$studentCount'] }, 2],
          },
          averageCompletion: { $round: ['$averageCompletion', 2] },
        },
      },
    ]).exec();

    // Get engagement by student
    const topEngagedStudents = await VideoWatchProgress.aggregate([
      {
        $group: {
          _id: '$studentId',
          videosWatched: { $sum: 1 },
          totalViews: { $sum: '$numberOfViews' },
          completedVideos: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
          averageCompletion: { $avg: '$completionPercentage' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $unwind: {
          path: '$studentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { averageCompletion: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          studentName: '$studentInfo.name',
          videosWatched: 1,
          totalViews: 1,
          completedVideos: 1,
          averageCompletion: { $round: ['$averageCompletion', 2] },
        },
      },
    ]).exec();

    logger.info('Retrieved engagement metrics', {
      context: 'analyticsService::getEngagementMetrics',
    });

    return {
      totalActiveStudents: activeStudents[0]?.total || 0,
      engagementByClass,
      topEngagedStudents,
    };
  } catch (error) {
    logger.error('Error fetching engagement metrics', {
      context: 'analyticsService::getEngagementMetrics',
      error: error.message,
    });
    throw error;
  }
};

// ============================================
// 8.4 ATTENDANCE ANALYTICS
// ============================================

/**
 * Get attendance statistics and patterns
 * @param {Object} options - { classId, days: 30 }
 * @returns {Promise<Object>} Attendance statistics
 */
const getAttendanceAnalytics = async (options = {}) => {
  try {
    const { classId, days = 30 } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Overall attendance stats
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          ...(classId && { classId: new (require('mongoose').Types.ObjectId)(classId) }),
        },
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalStudentsMarked: { $sum: '$totalStudents' },
          totalPresent: { $sum: '$presentCount' },
          totalAbsent: { $sum: '$absentCount' },
          totalLate: { $sum: '$lateCount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          totalStudentsMarked: 1,
          totalPresent: 1,
          totalAbsent: 1,
          totalLate: 1,
          overallAttendancePercentage: {
            $round: [
              { $multiply: [{ $divide: ['$totalPresent', '$totalStudentsMarked'] }, 100] },
              2,
            ],
          },
        },
      },
    ]).exec();

    // Attendance by class
    const attendanceByClass = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          ...(classId && { classId: new (require('mongoose').Types.ObjectId)(classId) }),
        },
      },
      {
        $group: {
          _id: '$classId',
          className: { $first: '$className' },
          recordCount: { $sum: 1 },
          totalStudents: { $first: '$totalStudents' },
          totalPresent: { $sum: '$presentCount' },
          totalAbsent: { $sum: '$absentCount' },
          averageAttendance: { $avg: { $divide: ['$presentCount', '$totalStudents'] } },
        },
      },
      {
        $sort: { averageAttendance: -1 },
      },
      {
        $project: {
          className: 1,
          recordCount: 1,
          totalPresent: 1,
          totalAbsent: 1,
          averageAttendancePercentage: {
            $round: [{ $multiply: ['$averageAttendance', 100] }, 2],
          },
        },
      },
    ]).exec();

    // Chronic absentees (< 75% attendance)
    const chronicAbsentees = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          ...(classId && { classId: new (require('mongoose').Types.ObjectId)(classId) }),
        },
      },
      { $unwind: '$attendance' },
      {
        $group: {
          _id: {
            studentId: '$attendance.studentId',
            studentName: '$attendance.studentName',
          },
          totalMarked: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$attendance.status', 'present'] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$attendance.status', 'absent'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          studentId: '$_id.studentId',
          studentName: '$_id.studentName',
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$presentDays', '$totalMarked'] }, 100] }, 2],
          },
          presentDays: 1,
          absentDays: 1,
          totalMarked: 1,
        },
      },
      {
        $match: {
          attendancePercentage: { $lt: 75 },
        },
      },
      {
        $sort: { attendancePercentage: 1 },
      },
      {
        $limit: 20,
      },
    ]).exec();

    logger.info('Retrieved attendance analytics', {
      context: 'analyticsService::getAttendanceAnalytics',
      absenteeCount: chronicAbsentees.length,
    });

    return {
      overallStats: attendanceStats[0] || {},
      byClass: attendanceByClass,
      chronicAbsentees,
    };
  } catch (error) {
    logger.error('Error fetching attendance analytics', {
      context: 'analyticsService::getAttendanceAnalytics',
      error: error.message,
    });
    throw error;
  }
};

// ============================================
// 8.5 FINANCIAL ANALYTICS (Bhavishya's Part)
// ============================================

/**
 * Get revenue/financial analytics
 * Note: Payment model will be created in Phase 7 by Arpit
 * This provides structure for integration
 * @returns {Promise<Object>} Revenue statistics
 */
const getRevenueAnalytics = async () => {
  try {
    // Note: Payment model to be implemented in Phase 7
    // Placeholder structure for future integration
    logger.info('Retrieved revenue analytics structure', {
      context: 'analyticsService::getRevenueAnalytics',
      note: 'Awaiting Payment model from Phase 7',
    });

    return {
      status: 'Phase 8 (Bhavishya)',
      message: 'Revenue analytics awaiting Payment model (Phase 7 - Arpit)',
      placeholder: {
        totalRevenue: 0,
        paymentsByMethod: [],
        paymentTrends: [],
        pendingFees: 0,
      },
    };
  } catch (error) {
    logger.error('Error fetching revenue analytics', {
      context: 'analyticsService::getRevenueAnalytics',
      error: error.message,
    });
    throw error;
  }
};

// ============================================
// 8.7 REPORT GENERATION
// ============================================

/**
 * Generate comprehensive analytics report
 * @param {String} reportType - 'video'|'engagement'|'attendance'|'comprehensive'
 * @param {Object} options - Filter and format options
 * @returns {Promise<Object>} Report data
 */
const generateAnalyticsReport = async (reportType, options = {}) => {
  try {
    const reportTimestamp = new Date();
    let report = {
      type: reportType,
      generatedAt: reportTimestamp,
      generatedBy: options.userId || 'System',
      period: options.period || 'Last 30 Days',
    };

    switch (reportType) {
      case 'video':
        report.data = await getMostWatchedVideos(options);
        report.title = 'Video Viewership Report';
        break;

      case 'engagement':
        report.data = await getEngagementMetrics();
        report.title = 'Student Engagement Report';
        break;

      case 'attendance':
        report.data = await getAttendanceAnalytics(options);
        report.title = 'Attendance Analytics Report';
        break;

      case 'comprehensive':
      default:
        report.data = {
          videoAnalytics: await getMostWatchedVideos({ limit: 5 }),
          engagementMetrics: await getEngagementMetrics(),
          attendanceData: await getAttendanceAnalytics(options),
          viewershipTrends: await getViewershipTrends(options),
        };
        report.title = 'Comprehensive System Report';
        break;
    }

    logger.info(`Generated ${reportType} analytics report`, {
      context: 'analyticsService::generateAnalyticsReport',
      reportType,
    });

    return report;
  } catch (error) {
    logger.error('Error generating analytics report', {
      context: 'analyticsService::generateAnalyticsReport',
      reportType,
      error: error.message,
    });
    throw error;
  }
};

// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {
  // 8.1 Video Viewership
  getMostWatchedVideos,
  getVideoDetailAnalytics,

  // 8.2 Viewership Trends
  getViewershipTrends,
  getPeakWatchTimes,

  // 8.3 Engagement
  getEngagementMetrics,

  // 8.4 Attendance
  getAttendanceAnalytics,

  // 8.5 Financial
  getRevenueAnalytics,

  // 8.7 Report Generation
  generateAnalyticsReport,
};
