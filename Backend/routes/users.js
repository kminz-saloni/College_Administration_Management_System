/**
 * Users Routes
 * All routes related to user profile management and user listing
 * Phase 3: Dashboard & User Management
 */

const express = require('express');
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================
// USER PROFILE ROUTES (Protected)
// ============================================

/**
 * GET /users/profile
 * Fetch current user profile
 * @returns {Object} - {success, data: {user profile}}
 * @access Private
 */
router.get('/profile', usersController.getProfile);

/**
 * PUT /users/profile
 * Update current user profile
 * @body {string} name - User name (optional)
 * @body {string} phone - User phone (optional)
 * @body {string} department - User department (optional)
 * @body {string} designation - User designation (optional)
 * @body {string} profilePicture - Profile picture URL (optional)
 * @returns {Object} - {success, data: {updated user profile}}
 * @access Private
 */
router.put('/profile', usersController.updateProfile);

// ============================================
// USER LISTING ROUTES (Admin only)
// ============================================

/**
 * GET /dashboard/users
 * List all users with pagination and filters
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10, max: 100)
 *   - role: Filter by role (admin|teacher|student)
 *   - search: Search by name or email
 *   - sortBy: Sort field (default: createdAt)
 *   - sortOrder: asc or desc (default: desc)
 * @returns {Object} - {success, data: {users array, pagination}}
 * @access Admin only
 */
router.get('/dashboard/users', roleGuard(['admin']), usersController.listUsers);

/**
 * GET /users/:id
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Object} - {success, data: {user profile}}
 * @access Admin or self
 */
router.get('/:id', usersController.getUserById);

// ============================================
// ADMIN USER MANAGEMENT ROUTES
// ============================================

/**
 * PUT /users/admin/:id
 * Update user by ID (Admin only)
 * @param {string} id - User ID
 * @returns {Object} - {success, data: {updated user}}
 * @access Admin only
 */
router.put('/admin/:id', roleGuard(['admin']), usersController.updateUserByAdmin);

/**
 * POST /users/admin/invite
 * Create an invited user profile (Admin only)
 * @access Admin only
 */
router.post('/admin/invite', roleGuard(['admin']), usersController.createUserByAdmin);

/**
 * DELETE /users/admin/:id
 * Delete user by ID (Admin only - soft delete)
 * @param {string} id - User ID
 * @returns {Object} - {success, data: {message}}
 * @access Admin only
 */
router.delete('/admin/:id', roleGuard(['admin']), usersController.deleteUserByAdmin);

module.exports = router;
