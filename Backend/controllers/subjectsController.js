/**
 * Subjects Controller
 * Handles subject management for teachers
 * Per SRS 4.2: Teacher-driven subject assignment
 */

const Subject = require('../models/Subject');
const { seedSubjects } = require('../services/seederService');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const constants = require('../config/constants');

// ============================================
// GET ALL SUBJECTS
// ============================================

/**
 * Get all active subjects
 * GET /subjects
 * Public endpoint - available for teacher signup and class assignment
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllSubjects = async (req, res, next) => {
  try {
    logger.info('Fetching all subjects');

    const subjects = await Subject.find({
      isActive: true,
      deletedAt: null,
    })
      .select('_id name code department description')
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, {
      subjects,
      total: subjects.length,
    }, 'Subjects retrieved successfully');
  } catch (error) {
    logger.error('Error fetching subjects', { error: error.message });
    next(error);
  }
};

// ============================================
// GET SUBJECT BY ID
// ============================================

/**
 * Get subject by ID
 * GET /subjects/:id
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching subject by ID', { subjectId: id });

    const subject = await Subject.findById(id)
      .select('_id name code department description isActive')
      .lean();

    if (!subject || subject.deletedAt) {
      return sendError(
        res,
        'Subject not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    return sendSuccess(res, { subject }, 'Subject retrieved successfully');
  } catch (error) {
    logger.error('Error fetching subject', { error: error.message });
    next(error);
  }
};

// ============================================
// CREATE SUBJECT (ADMIN ONLY)
// ============================================

/**
 * Create a new subject
 * POST /subjects
 * Admin only
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, department } = req.body;
    
    logger.info('Creating new subject', { name, code });

    // Validation
    if (!name || !code) {
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        { message: 'Name and code are required' },
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
    if (existingSubject) {
      return sendError(
        res,
        'Subject code already exists',
        constants.ERROR_CODES.CONFLICT,
        { field: 'code', message: 'This subject code is already in use' },
        constants.HTTP_STATUS.CONFLICT
      );
    }

    // Create subject
    const subject = new Subject({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim(),
      department: department?.trim(),
      isActive: true,
    });

    await subject.save();

    logger.info('Subject created successfully', { subjectId: subject._id });

    return sendSuccess(
      res,
      { subject },
      'Subject created successfully',
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error('Error creating subject', { error: error.message });
    next(error);
  }
};

// ============================================
// UPDATE SUBJECT (ADMIN ONLY)
// ============================================

/**
 * Update a subject
 * PUT /subjects/:id
 * Admin only
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, department, isActive } = req.body;

    logger.info('Updating subject', { subjectId: id });

    // Find subject
    const subject = await Subject.findById(id);
    if (!subject || subject.deletedAt) {
      return sendError(
        res,
        'Subject not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Check if new code conflicts with another subject
    if (code && code !== subject.code) {
      const existingSubject = await Subject.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingSubject) {
        return sendError(
          res,
          'Subject code already exists',
          constants.ERROR_CODES.CONFLICT,
          { field: 'code', message: 'This subject code is already in use' },
          constants.HTTP_STATUS.CONFLICT
        );
      }
    }

    // Update fields
    if (name) subject.name = name.trim();
    if (code) subject.code = code.toUpperCase().trim();
    if (description !== undefined) subject.description = description?.trim();
    if (department !== undefined) subject.department = department?.trim();
    if (isActive !== undefined) subject.isActive = isActive;

    subject.updatedAt = new Date();
    await subject.save();

    logger.info('Subject updated successfully', { subjectId: subject._id });

    return sendSuccess(res, { subject }, 'Subject updated successfully');
  } catch (error) {
    logger.error('Error updating subject', { error: error.message });
    next(error);
  }
};

// ============================================
// DELETE SUBJECT (ADMIN ONLY)
// ============================================

/**
 * Soft delete a subject
 * DELETE /subjects/:id
 * Admin only
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Deleting subject', { subjectId: id });

    // Find subject
    const subject = await Subject.findById(id);
    if (!subject || subject.deletedAt) {
      return sendError(
        res,
        'Subject not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Soft delete
    subject.deletedAt = new Date();
    subject.isActive = false;
    await subject.save();

    logger.info('Subject deleted successfully', { subjectId: subject._id });

    return sendSuccess(res, null, 'Subject deleted successfully');
  } catch (error) {
    logger.error('Error deleting subject', { error: error.message });
    next(error);
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  seedSubjects: async (req, res, next) => {
    try {
      logger.info('Admin seeding subjects');
      const seededSubjects = await seedSubjects();
      return sendSuccess(
        res,
        { 
          count: seededSubjects.length,
          subjects: seededSubjects,
        },
        `Successfully seeded ${seededSubjects.length} subjects`,
        constants.HTTP_STATUS.CREATED
      );
    } catch (error) {
      logger.error('Error seeding subjects', { error: error.message });
      next(error);
    }
  },
};
