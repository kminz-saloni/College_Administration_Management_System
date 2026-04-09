/**
 * Dashboard Routes
 * All routes related to dashboard statistics and role-based dashboards
 * Phase 3: Dashboard & User Management
 */

const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================
// GENERAL DASHBOARD STATISTICS
// ============================================

/**
 * GET /dashboard/stats
 * Get overall dashboard statistics
 * System-wide metrics including:
 *   - Total users count by role
 *   - Total classes
 *   - Total enrollments
 *   - Average students per class
 *   - System health metrics
 * @returns {Object} - {success, data: {statistics}}
 * @access Admin only
 */
router.get('/stats', roleGuard(['admin']), dashboardController.getDashboardStats);

// ============================================
// ROLE-BASED DASHBOARDS
// ============================================

/**
 * GET /dashboard/admin
 * Get admin dashboard data
 * Includes:
 *   - User statistics by role
 *   - Active classes count
 *   - Recent users list
 *   - Top classes by enrollment
 * @returns {Object} - {success, data: {admin dashboard data}}
 * @access Admin only
 */
router.get('/admin', roleGuard(['admin']), dashboardController.getAdminDashboard);

/**
 * GET /dashboard/teacher
 * Get teacher dashboard data
 * Includes:
 *   - Teacher's classes list
 *   - Total students taught
 *   - Total classes count
 * @returns {Object} - {success, data: {teacher dashboard data}}
 * @access Teacher only
 */
router.get('/teacher', roleGuard(['teacher']), dashboardController.getTeacherDashboard);

/**
 * GET /dashboard/student
 * Get student dashboard data
 * Includes:
 *   - Student's enrolled classes
 *   - Total enrolled classes count
 * @returns {Object} - {success, data: {student dashboard data}}
 * @access Student only
 */
router.get('/student', roleGuard(['student']), dashboardController.getStudentDashboard);

// ============================================
// SHARED DATA ENDPOINTS
// ============================================

/**
 * GET /dashboard/classes
 * Get classes list
 * - Admin/Teacher: all active classes
 * - Student: their enrolled classes (via getStudentDashboard logic)
 * @access Admin, Teacher, Student (role-filtered)
 */
router.get('/classes', dashboardController.getDashboardClasses);

/**
 * GET /dashboard/users
 * Get users list (admin/teacher only)
 * @access Admin, Teacher
 */
router.get('/users', roleGuard(['admin', 'teacher']), dashboardController.getDashboardUsers);

/**
 * GET /dashboard/reports
 * Get reports data (admin only)
 * @access Admin
 */
router.get('/reports', roleGuard(['admin']), dashboardController.getDashboardReports);

module.exports = router;
