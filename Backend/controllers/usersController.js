/**
 * Users Controller
 * Handles user profile management and user listing operations
 * Phase 3: Dashboard & User Management
 */

const User = require('../models/User');
const Department = require('../models/Department');
const Semester = require('../models/Semester');
const Section = require('../models/Section');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const StudentSubjectEnrollment = require('../models/StudentSubjectEnrollment');
const Class = require('../models/Class');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const { validateUpdateProfile, validateInviteUser, extractValidationErrors } = require('../utils/validators');
const constants = require('../config/constants');

const getOrCreateLookup = async (Model, query, payload) => {
  const found = await Model.findOne(query);
  if (found) {
    return found;
  }

  const created = new Model(payload);
  await created.save();
  return created;
};

const normalizeLookupCode = (value) => value.trim().toUpperCase().replace(/\s+/g, '_');

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

/**
 * Get current user profile
 * GET /users/profile
 * @param {Object} req - Express request (must include authorized user)
 * @param {Object} res - Express response
 */
const getProfile = async (req, res, next) => {
  try {
    logger.info('Fetching user profile', { userId: req.user._id });

    // Get user from database (user should already be in req.user from auth middleware)
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      logger.warn('User profile not found', { userId: req.user._id });
      return sendError(
        res,
        'User profile not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    if (!user.isActive) {
      logger.warn('User account is inactive', { userId: req.user._id });
      return sendError(
        res,
        'User account is inactive',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    logger.info('User profile retrieved successfully', { userId: req.user._id });

    return sendSuccess(res, 'User profile retrieved successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      department: user.department,
      designation: user.designation,
      profilePicture: user.profilePicture,
      activatedAt: user.activatedAt,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error('Error fetching user profile', { error: error.message, userId: req.user._id });
    next(error);
  }
};

/**
 * Update user profile
 * PUT /users/profile
 * @param {Object} req - Express request with update data in body
 * @param {Object} res - Express response
 */
const updateProfile = async (req, res, next) => {
  try {
    logger.info('Updating user profile', { userId: req.user._id });

    // Validate input
    const { error, value } = validateUpdateProfile(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { name, phone, profilePicture } = value;

    // Find and update user
    const user = await User.findById(req.user._id);

    if (!user) {
      logger.warn('User not found for update', { userId: req.user._id });
      return sendError(
        res,
        'User not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;

    user.updatedAt = new Date();

    await user.save();

    logger.info('User profile updated successfully', { userId: req.user._id });

    return sendSuccess(res, 'User profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      department: user.department,
      designation: user.designation,
      profilePicture: user.profilePicture,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    logger.error('Error updating user profile', { error: error.message, userId: req.user._id });
    next(error);
  }
};

// ============================================
// USER LISTING ENDPOINTS
// ============================================

/**
 * List all users with pagination and filters
 * GET /dashboard/users?page=1&limit=10&role=student&search=john
 * Only Admin can access this endpoint
 * @param {Object} req - Express request with query parameters
 * @param {Object} res - Express response
 */
const listUsers = async (req, res, next) => {
  try {
    logger.info('Listing users', { requestedBy: req.user._id, query: req.query });

    // Extract query parameters
    const page = parseInt(req.query.page, 10) || constants.PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || constants.PAGINATION_DEFAULTS.LIMIT,
      constants.PAGINATION_DEFAULTS.MAX_LIMIT,
    );
    const { role } = req.query;
    const { search } = req.query;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter
    const filter = {
      deletedAt: null,
    };

    // Add role filter if provided
    if (role && Object.values(constants.ROLES).includes(role)) {
      filter.role = role;
    }

    // Add search filter if provided (search in name or email)
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    logger.info('Users listed successfully', {
      page, limit, total, count: users.length,
    });

    return sendSuccess(res, 'Users retrieved successfully', {
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        department: user.department,
        designation: user.designation,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error listing users', { error: error.message });
    next(error);
  }
};

/**
 * Get user by ID
 * GET /users/:id
 * Only Admin or the user themselves can access
 * @param {Object} req - Express request with userId in params
 * @param {Object} res - Express response
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching user by ID', { userId: id, requestedBy: req.user._id });

    // Check authorization
    if (req.user.role !== constants.ROLES.ADMIN && req.user._id.toString() !== id) {
      logger.warn('User attempted to access another user profile', {
        requestedBy: req.user._id,
        targetUser: id,
      });
      return sendError(
        res,
        'Unauthorized: Cannot access this user profile',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    const user = await User.findById(id).select('-password -emailVerificationToken -passwordResetToken');

    if (!user || !user.isActive) {
      logger.warn('User not found or inactive', { userId: id });
      return sendError(
        res,
        'User not found or inactive',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    logger.info('User retrieved successfully', { userId: id });

    return sendSuccess(res, 'User retrieved successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      department: user.department,
      designation: user.designation,
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error('Error fetching user by ID', { error: error.message });
    next(error);
  }
};

// ============================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * Update user by ID (Admin only)
 * PUT /users/admin/:id
 * Admin can update any user's profile
 * @param {Object} req - Express request with userId in params
 * @param {Object} res - Express response
 */
const updateUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, department, designation, status, isActive,
    } = req.body;

    logger.info('Admin updating user', { adminId: req.user._id, targetUserId: id });

    const user = await User.findById(id);

    if (!user) {
      logger.warn('User not found for admin update', { userId: id });
      return sendError(
        res,
        'User not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (existingUser) {
        return sendError(
          res,
          'Email already in use',
          constants.ERROR_CODES.EMAIL_ALREADY_EXISTS,
          null,
          constants.HTTP_STATUS.CONFLICT,
        );
      }
      user.email = email.toLowerCase();
    }
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (designation !== undefined) user.designation = designation;
    if (status && Object.values(constants.USER_STATUSES).includes(status)) {
      user.status = status;
      user.isActive = status === constants.USER_STATUSES.ACTIVE;
      if (status === constants.USER_STATUSES.ACTIVE && !user.activatedAt) {
        user.activatedAt = new Date();
      }
    }
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
      user.status = isActive ? constants.USER_STATUSES.ACTIVE : constants.USER_STATUSES.INACTIVE;
      if (isActive && !user.activatedAt) {
        user.activatedAt = new Date();
      }
    }

    user.updatedAt = new Date();
    await user.save();

    logger.info('User updated by admin successfully', { userId: id });

    return sendSuccess(res, 'User updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      department: user.department,
      designation: user.designation,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    logger.error('Error updating user by admin', { error: error.message });
    next(error);
  }
};

/**
 * Delete user by ID (Admin only - soft delete)
 * DELETE /users/admin/:id
 * Admin can delete any user (soft delete)
 * @param {Object} req - Express request with userId in params
 * @param {Object} res - Express response
 */
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Admin deleting user', { adminId: req.user._id, targetUserId: id });

    if (id === req.user._id.toString()) {
      return sendError(
        res,
        'Cannot delete your own account',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    const user = await User.findById(id);

    if (!user) {
      logger.warn('User not found for deletion', { userId: id });
      return sendError(
        res,
        'User not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    if (user.role === constants.ROLES.STUDENT) {
      await Promise.all([
        StudentProfile.deleteOne({ userId: user._id }),
        StudentSubjectEnrollment.deleteMany({ studentId: user._id }),
        Class.updateMany({ students: user._id }, { $pull: { students: user._id } }),
      ]);
    }

    if (user.role === constants.ROLES.TEACHER) {
      await Promise.all([
        TeacherProfile.deleteOne({ userId: user._id }),
        Class.updateMany(
          { teacher: user._id },
          { $set: { isActive: false, status: 'archived', deletedAt: new Date() } },
        ),
      ]);
    }

    user.isActive = false;
    user.status = constants.USER_STATUSES.INACTIVE;
    user.deletedAt = new Date();
    await user.save();

    logger.info('User deleted by admin successfully', { userId: id });

    return sendSuccess(res, 'User deleted successfully', {
      id: user._id,
      message: 'User has been deactivated',
    });
  } catch (error) {
    logger.error('Error deleting user by admin', { error: error.message });
    next(error);
  }
};

/**
 * Create an invited user profile (Admin only)
 * POST /users/admin/invite
 */
const createUserByAdmin = async (req, res, next) => {
  try {
    const { error, value } = validateInviteUser(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST,
      );
    }

    const {
      name,
      email,
      phone,
      role,
      department,
      designation,
      employeeId,
      rollNo,
      semester,
      semesterId,
      section,
      sectionId,
      classId,
      admissionYear,
      photo,
      subjectIds,
    } = value;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.deletedAt === null) {
      return sendError(
        res,
        'Email already exists',
        constants.ERROR_CODES.CONFLICT,
        { field: 'email', message: 'This email is already in use' },
        constants.HTTP_STATUS.CONFLICT,
      );
    }

    let departmentDoc = null;
    if (department) {
      departmentDoc = await getOrCreateLookup(
        Department,
        {
          $or: [
            { name: new RegExp(`^${department}$`, 'i') },
            { code: normalizeLookupCode(department) },
          ],
        },
        { name: department, code: normalizeLookupCode(department) },
      );
    }

    let semesterDoc = null;
    if (semesterId) {
      semesterDoc = await Semester.findById(semesterId);
    } else if (semester) {
      semesterDoc = await getOrCreateLookup(
        Semester,
        {
          $or: [
            { name: new RegExp(`^${semester}$`, 'i') },
            { code: normalizeLookupCode(semester) },
          ],
        },
        {
          name: semester,
          code: normalizeLookupCode(semester),
          order: Number.parseInt(semester, 10) || 1,
        },
      );
    }

    let sectionDoc = null;
    if (sectionId) {
      sectionDoc = await Section.findById(sectionId);
    } else if (section) {
      sectionDoc = await getOrCreateLookup(
        Section,
        {
          $or: [
            { name: new RegExp(`^${section}$`, 'i') },
            { code: normalizeLookupCode(section) },
          ],
        },
        { name: section, code: normalizeLookupCode(section) },
      );
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      role,
      phone,
      department: departmentDoc?.name || department || '',
      designation: designation || '',
      status: constants.USER_STATUSES.INVITE_PENDING,
      isActive: false,
      emailVerified: false,
      invitedBy: req.user._id,
      profilePicture: photo || '',
      subjects: role === constants.ROLES.TEACHER ? subjectIds : [],
    });

    await user.save();

    if (role === constants.ROLES.STUDENT) {
      const studentProfile = new StudentProfile({
        userId: user._id,
        rollNo,
        departmentId: departmentDoc?._id,
        semesterId: semesterDoc?._id || semesterId || null,
        sectionId: sectionDoc?._id || sectionId || null,
        classId: classId || null,
        admissionYear,
        phone: phone || '',
        photo: photo || '',
      });
      await studentProfile.save();
    }

    if (role === constants.ROLES.TEACHER) {
      const teacherProfile = new TeacherProfile({
        userId: user._id,
        employeeId,
        departmentId: departmentDoc?._id,
        designation,
        phone: phone || '',
        photo: photo || '',
      });
      await teacherProfile.save();
    }

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department: user.department,
        },
      },
      'Invited user created successfully',
      constants.HTTP_STATUS.CREATED,
    );
  } catch (error) {
    logger.error('Error creating invited user', { error: error.message });
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
};
