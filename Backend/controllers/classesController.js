/**
 * Classes Controller
 * Handles class CRUD operations and class management
 * Phase 3: Dashboard & User Management
 */

const Class = require('../models/Class');
const User = require('../models/User');
const Subject = require('../models/Subject');
const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const { validateClass, validateClassUpdate, extractValidationErrors } = require('../utils/validators');
const constants = require('../config/constants');

// ============================================
// CREATE CLASS
// ============================================

/**
 * Create a new class
 * POST /api/classes
 * Only Teacher and Admin can create classes
 * @param {Object} req - Express request with class data in body
 * @param {Object} res - Express response
 */
const createClass = async (req, res, next) => {
  try {
    logger.info('Creating new class', {
      createdBy: req.user._id,
      body: req.body,
    });

    // Validate input
    const { error, value } = validateClass(req.body);
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
      classCode,
      subjectId,
      teacherId: requestedTeacherId,
      departmentId,
      semesterId,
      sectionId,
      description,
      schedule,
      academicYear,
      semester,
      capacity,
    } = value;

    // Determine teacher ID
    let teacherId;
    if (req.user.role === constants.ROLES.TEACHER) {
      teacherId = req.user._id;
    } else if (req.user.role === constants.ROLES.ADMIN && requestedTeacherId) {
      // Admin can assign class to a teacher
      teacherId = requestedTeacherId;
    } else {
      return sendError(
        res,
        'Only teachers and admins can create classes',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    // Verify teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== constants.ROLES.TEACHER) {
      logger.warn('Invalid teacher ID for class creation', { teacherId });
      return sendError(
        res,
        'Invalid teacher ID',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    const subjectDoc = await Subject.findOne({
      _id: subjectId,
      isActive: true,
      deletedAt: null,
    });

    if (!subjectDoc) {
      return sendError(
        res,
        'Invalid subject ID',
        constants.ERROR_CODES.NOT_FOUND,
        { field: 'subjectId', message: 'Subject does not exist or is inactive' },
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    const duplicateQuery = classCode
      ? { classCode: classCode.trim(), deletedAt: null }
      : {
        name: name.trim(),
        subjectId,
        teacher: teacherId,
        academicYear: academicYear || '',
        semesterId: semesterId || null,
        sectionId: sectionId || null,
        deletedAt: null,
      };

    const existingClass = await Class.findOne(duplicateQuery);
    if (existingClass) {
      return sendError(
        res,
        'Class already exists',
        constants.ERROR_CODES.CONFLICT,
        { field: 'classCode', message: 'Duplicate class definition detected' },
        constants.HTTP_STATUS.CONFLICT,
      );
    }

    // Create new class
    const newClass = new Class({
      name,
      classCode: classCode?.trim() || `CLS-${Date.now()}`,
      subjectId,
      subject: subjectDoc.name,
      description: description || '',
      teacher: teacherId,
      teacherName: teacher.name,
      schedule: schedule || {},
      departmentId: departmentId || null,
      semesterId: semesterId || null,
      sectionId: sectionId || null,
      academicYear: academicYear || '',
      semester: semester || '',
      capacity: capacity || 50,
      maxCapacity: capacity || 50,
      students: [],
      studentCount: 0,
      isActive: true,
      status: 'active',
    });

    await newClass.save();

    await TeacherSubjectAssignment.findOneAndUpdate(
      {
        teacherId,
        subjectId,
        classId: newClass._id,
      },
      {
        teacherId,
        subjectId,
        classId: newClass._id,
        assignedBy: req.user._id,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    logger.info('Class created successfully', {
      classId: newClass._id,
      createdBy: req.user._id,
    });

    return sendSuccess(res, 'Class created successfully', {
      id: newClass._id,
      classCode: newClass.classCode,
      name: newClass.name,
      subject: newClass.subject,
      description: newClass.description,
      teacher: {
        id: newClass.teacher,
        name: newClass.teacherName,
      },
      schedule: newClass.schedule,
      departmentId: newClass.departmentId,
      semesterId: newClass.semesterId,
      sectionId: newClass.sectionId,
      capacity: newClass.capacity,
      academicYear: newClass.academicYear,
      semester: newClass.semester,
      createdAt: newClass.createdAt,
    });
  } catch (error) {
    logger.error('Error creating class', { error: error.message });
    next(error);
  }
};

// ============================================
// GET CLASSES
// ============================================

/**
 * Get all classes with filters and pagination
 * GET /dashboard/classes?page=1&limit=10&subject=Math&teacher=xxx
 * @param {Object} req - Express request with query parameters
 * @param {Object} res - Express response
 */
const getClasses = async (req, res, next) => {
  try {
    logger.info('Fetching classes', { requestedBy: req.user._id, query: req.query });

    // Extract query parameters
    const page = parseInt(req.query.page, 10) || constants.PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      parseInt(req.query.limit, 10) || constants.PAGINATION_DEFAULTS.LIMIT,
      constants.PAGINATION_DEFAULTS.MAX_LIMIT,
    );
    const { subject } = req.query;
    const { teacher } = req.query;
    const { academicYear } = req.query;

    // Build filter based on role
    const filter = {
      isActive: true,
      deletedAt: null,
    };

    // Students can only see classes they're enrolled in
    if (req.user.role === constants.ROLES.STUDENT) {
      filter.students = req.user._id;
    }

    // Teachers can see their own classes (unless admin)
    if (req.user.role === constants.ROLES.TEACHER) {
      filter.teacher = req.user._id;
    }

    // Add optional filters
    if (subject) {
      filter.subject = new RegExp(subject, 'i');
    }

    if (teacher && req.user.role === constants.ROLES.ADMIN) {
      filter.teacher = teacher;
    }

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const classes = await Class.find(filter)
      .select('name classCode subject subjectId teacher teacherName schedule studentCount academicYear semester capacity departmentId semesterId sectionId status')
      .populate('teacher', 'name email')
      .populate('subjectId', 'name code department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Class.countDocuments(filter);

    logger.info('Classes retrieved successfully', {
      page,
      limit,
      total,
      count: classes.length,
    });

    return sendSuccess(res, 'Classes retrieved successfully', {
      classes: classes.map((cls) => ({
        id: cls._id,
        classCode: cls.classCode,
        name: cls.name,
        subject: cls.subjectId?.name || cls.subject,
        subjectId: cls.subjectId?._id || cls.subjectId,
        teacher: {
          id: cls.teacher._id,
          name: cls.teacher.name,
        },
        students: cls.studentCount,
        schedule: cls.schedule || {},
        academicYear: cls.academicYear,
        semester: cls.semester,
        capacity: cls.capacity,
        departmentId: cls.departmentId,
        semesterId: cls.semesterId,
        sectionId: cls.sectionId,
        status: cls.status || 'active',
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching classes', { error: error.message });
    next(error);
  }
};

/**
 * Get class by ID
 * GET /api/classes/:id
 * @param {Object} req - Express request with classId in params
 * @param {Object} res - Express response
 */
const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Fetching class by ID', { classId: id, requestedBy: req.user._id });

    const classData = await Class.findById(id)
      .populate('teacher', 'name email department')
      .populate('students', 'name email')
      .populate('subjectId', 'name code department')
      .lean();

    if (!classData || !classData.isActive) {
      logger.warn('Class not found or inactive', { classId: id });
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    // Check access permissions
    const hasAccess = req.user.role === constants.ROLES.ADMIN
      || classData.teacher._id.toString() === req.user._id.toString()
      || classData.students.includes(req.user._id);

    if (!hasAccess) {
      logger.warn('User does not have access to class', { classId: id, userId: req.user._id });
      return sendError(
        res,
        'Unauthorized: Cannot access this class',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    logger.info('Class retrieved successfully', { classId: id });

    return sendSuccess(res, 'Class retrieved successfully', {
      id: classData._id,
      classCode: classData.classCode,
      name: classData.name,
      subject: classData.subjectId?.name || classData.subject,
      subjectId: classData.subjectId?._id || classData.subjectId,
      description: classData.description,
      teacher: {
        id: classData.teacher._id,
        name: classData.teacher.name,
        email: classData.teacher.email,
      },
      students: classData.studentCount,
      schedule: classData.schedule || {},
      academicYear: classData.academicYear,
      semester: classData.semester,
      capacity: classData.capacity,
      departmentId: classData.departmentId,
      semesterId: classData.semesterId,
      sectionId: classData.sectionId,
      status: classData.status || 'active',
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
    });
  } catch (error) {
    logger.error('Error fetching class by ID', { error: error.message });
    next(error);
  }
};

// ============================================
// UPDATE CLASS
// ============================================

/**
 * Update class
 * PUT /api/classes/:id
 * Only class teacher or admin can update
 * @param {Object} req - Express request with class data in body
 * @param {Object} res - Express response
 */
const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Updating class', { classId: id, updatedBy: req.user._id });

    // Find class
    const classData = await Class.findById(id);

    if (!classData || !classData.isActive) {
      logger.warn('Class not found for update', { classId: id });
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    // Check authorization
    const isAuthorized = req.user.role === constants.ROLES.ADMIN
      || classData.teacher.toString() === req.user._id.toString();

    if (!isAuthorized) {
      logger.warn('User not authorized to update class', { classId: id, userId: req.user._id });
      return sendError(
        res,
        'Unauthorized: Cannot update this class',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    // Validate input
    const { error, value } = validateClassUpdate(req.body);
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

    // Update fields
    if (value.name) classData.name = value.name;
    if (value.subjectId) {
      const subjectDoc = await Subject.findOne({
        _id: value.subjectId,
        deletedAt: null,
        isActive: true,
      });
      if (!subjectDoc) {
        return sendError(
          res,
          'Invalid subject ID',
          constants.ERROR_CODES.NOT_FOUND,
          { field: 'subjectId', message: 'Subject does not exist or is inactive' },
          constants.HTTP_STATUS.NOT_FOUND,
        );
      }
      classData.subjectId = subjectDoc._id;
      classData.subject = subjectDoc.name;
    }
    if (value.classCode) classData.classCode = value.classCode.trim();
    if (value.description !== undefined) classData.description = value.description;
    if (value.schedule) classData.schedule = { ...classData.schedule, ...value.schedule };
    if (value.capacity !== undefined) classData.capacity = value.capacity;
    if (value.academicYear !== undefined) classData.academicYear = value.academicYear;
    if (value.semester !== undefined) classData.semester = value.semester;
    if (value.departmentId !== undefined) classData.departmentId = value.departmentId || null;
    if (value.semesterId !== undefined) classData.semesterId = value.semesterId || null;
    if (value.sectionId !== undefined) classData.sectionId = value.sectionId || null;

    classData.updatedAt = new Date();

    await classData.save();

    logger.info('Class updated successfully', { classId: id });

    return sendSuccess(res, 'Class updated successfully', {
      id: classData._id,
      classCode: classData.classCode,
      name: classData.name,
      subject: classData.subject,
      subjectId: classData.subjectId,
      description: classData.description,
      schedule: classData.schedule,
      capacity: classData.capacity,
      academicYear: classData.academicYear,
      semester: classData.semester,
      departmentId: classData.departmentId,
      semesterId: classData.semesterId,
      sectionId: classData.sectionId,
      updatedAt: classData.updatedAt,
    });
  } catch (error) {
    logger.error('Error updating class', { error: error.message });
    next(error);
  }
};

// ============================================
// DELETE CLASS
// ============================================

/**
 * Delete (soft delete) class
 * DELETE /api/classes/:id
 * Only class teacher or admin can delete
 * @param {Object} req - Express request with classId in params
 * @param {Object} res - Express response
 */
const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Deleting class', { classId: id, deletedBy: req.user._id });

    const classData = await Class.findById(id);

    if (!classData || !classData.isActive) {
      logger.warn('Class not found for deletion', { classId: id });
      return sendError(
        res,
        'Class not found',
        constants.ERROR_CODES.NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND,
      );
    }

    // Check authorization
    const isAuthorized = req.user.role === constants.ROLES.ADMIN
      || classData.teacher.toString() === req.user._id.toString();

    if (!isAuthorized) {
      logger.warn('User not authorized to delete class', { classId: id, userId: req.user._id });
      return sendError(
        res,
        'Unauthorized: Cannot delete this class',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    // Soft delete and archive linked assignments
    await TeacherSubjectAssignment.updateMany(
      { classId: classData._id },
      { $set: { isActive: false } },
    );
    await classData.softDelete();

    logger.info('Class deleted successfully', { classId: id });

    return sendSuccess(res, 'Class deleted successfully', {
      id: classData._id,
      classCode: classData.classCode,
      message: 'Class has been archived',
    });
  } catch (error) {
    logger.error('Error deleting class', { error: error.message });
    next(error);
  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
};
