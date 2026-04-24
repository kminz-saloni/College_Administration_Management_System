/**
 * Classes Routes
 * All routes related to class management (CRUD operations)
 * Phase 3: Dashboard & User Management
 */

const express = require('express');
const classesController = require('../controllers/classesController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================
// CLASS CREATION (Teachers and Admins only)
// ============================================

/**
 * POST /api/classes
 * Create a new class
 * @body {string} name - Class name (required)
 * @body {string} subject - Subject name (required)
 * @body {string} description - Class description (optional)
 * @body {object} schedule - Class schedule (optional)
 *   - day: Day of week
 *   - startTime: Start time (HH:MM)
 *   - endTime: End time (HH:MM)
 *   - room: Room number
 * @body {string} academicYear - Academic year (e.g., "2025-2026") (optional)
 * @body {string} semester - Semester number (optional)
 * @body {number} capacity - Class capacity (default: 50)
 * @body {string} teacherId - Teacher ID (Admin only, assigning class to teacher) (optional)
 * @returns {Object} - {success, data: {class details}}
 * @access Teacher, Admin
 */
router.post('/', roleGuard(['teacher', 'admin']), classesController.createClass);

// ============================================
// CLASS RETRIEVAL
// ============================================

/**
 * GET /dashboard/classes
 * Get all classes with pagination and filters
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - subject: Filter by subject name
 *   - teacher: Filter by teacher ID (Admin only)
 *   - academicYear: Filter by academic year
 * Role-based filtering:
 *   - Admin: Can see all classes
 *   - Teacher: Sees only their classes
 *   - Student: Sees only classes they're enrolled in
 * @returns {Object} - {success, data: {classes array, pagination}}
 * @access All authenticated users
 */
router.get('/dashboard/classes', classesController.getClasses);

/**
 * GET /api/classes/:id
 * Get class by ID
 * @param {string} id - Class ID (required)
 * @returns {Object} - {success, data: {class details}}
 * @access Admin, Class teacher, Enrolled students
 */
router.get('/:id', classesController.getClassById);

// ============================================
// CLASS UPDATE
// ============================================

/**
 * PUT /api/classes/:id
 * Update class details
 * @param {string} id - Class ID (required)
 * @body {string} name - Class name (optional)
 * @body {string} subject - Subject name (optional)
 * @body {string} description - Class description (optional)
 * @body {object} schedule - Class schedule (optional)
 * @body {number} capacity - Class capacity (optional)
 * @body {string} academicYear - Academic year (optional)
 * @body {string} semester - Semester (optional)
 * @returns {Object} - {success, data: {updated class details}}
 * @access Class teacher, Admin only
 */
router.put('/:id', roleGuard(['teacher', 'admin']), classesController.updateClass);

// ============================================
// CLASS DELETION (Soft Delete)
// ============================================

/**
 * DELETE /api/classes/:id
 * Delete (archive) class
 * @param {string} id - Class ID (required)
 * @returns {Object} - {success, data: {deleted class ID}}
 * @access Class teacher, Admin only
 */
router.delete('/:id', roleGuard(['teacher', 'admin']), classesController.deleteClass);

module.exports = router;
