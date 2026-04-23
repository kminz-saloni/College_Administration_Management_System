/**
 * Subjects Routes
 * Routes for subject management
 */

const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjectsController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const constants = require('../config/constants');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /subjects
 * Get all active subjects (public - for teacher signup and class assignment)
 */
router.get('/', subjectsController.getAllSubjects);

/**
 * GET /subjects/:id
 * Get subject by ID
 */
router.get('/:id', subjectsController.getSubjectById);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * POST /subjects
 * Create a new subject (admin only)
 */
router.post('/', authMiddleware, roleGuard(constants.ROLES.ADMIN), subjectsController.createSubject);

/**
 * PUT /subjects/:id
 * Update a subject (admin only)
 */
router.put('/:id', authMiddleware, roleGuard(constants.ROLES.ADMIN), subjectsController.updateSubject);

/**
 * POST /subjects/seed
 * Seed default subjects (admin only)
 * This endpoint seeds 10 default subjects if none exist
 */
router.post('/seed', authMiddleware, roleGuard(constants.ROLES.ADMIN), subjectsController.seedSubjects);

/**
 * DELETE /subjects/:id
 * Delete a subject (admin only)
 */
router.delete('/:id', authMiddleware, roleGuard(constants.ROLES.ADMIN), subjectsController.deleteSubject);

// ============================================
// EXPORT
// ============================================

module.exports = router;
