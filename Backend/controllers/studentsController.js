const User = require('../models/User');
const Subject = require('../models/Subject');
const StudentSubjectEnrollment = require('../models/StudentSubjectEnrollment');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const constants = require('../config/constants');

const getEligibleSubjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user || user.role !== constants.ROLES.STUDENT) {
      return sendError(
        res,
        'Student account required',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    const subjects = await Subject.find({
      isActive: true,
      deletedAt: null,
      $or: [
        {
          department: {
            $regex: new RegExp(user.department || '.*', 'i'),
          },
        },
        { department: { $exists: false } },
      ],
    })
      .select('_id name code department description')
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, { subjects, total: subjects.length }, 'Eligible subjects retrieved successfully');
  } catch (error) {
    logger.error('Error fetching eligible subjects', { error: error.message });
    next(error);
  }
};

const saveStudentSubjectEnrollments = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user || user.role !== constants.ROLES.STUDENT) {
      return sendError(
        res,
        'Student account required',
        constants.ERROR_CODES.FORBIDDEN,
        null,
        constants.HTTP_STATUS.FORBIDDEN,
      );
    }

    const subjectIds = Array.isArray(req.body.subjectIds) ? req.body.subjectIds : [];
    if (subjectIds.length === 0) {
      return sendError(
        res,
        'At least one subject is required',
        constants.ERROR_CODES.VALIDATION_ERROR,
        [{ field: 'subjectIds', message: 'Select at least one subject' }],
        constants.HTTP_STATUS.BAD_REQUEST,
      );
    }

    const subjects = await Subject.find({
      _id: { $in: subjectIds },
      isActive: true,
      deletedAt: null,
    }).lean();
    if (subjects.length !== subjectIds.length) {
      return sendError(
        res,
        'One or more subjects are invalid',
        constants.ERROR_CODES.CONFLICT,
        [{ field: 'subjectIds', message: 'Selected subjects must be active and valid' }],
        constants.HTTP_STATUS.CONFLICT,
      );
    }

    const eligibleDepartment = user.department;
    if (eligibleDepartment) {
      const invalidSubject = subjects.find((subject) => {
        const subjectDepartment = subject.department
          ? subject.department.toLowerCase()
          : '';
        return subjectDepartment && subjectDepartment !== eligibleDepartment.toLowerCase();
      });
      if (invalidSubject) {
        return sendError(
          res,
          'Selected subject is outside the student department',
          constants.ERROR_CODES.FORBIDDEN,
          [{ field: 'subjectIds', message: 'Subjects must belong to the student department' }],
          constants.HTTP_STATUS.FORBIDDEN,
        );
      }
    }

    await StudentSubjectEnrollment.deleteMany({ studentId: user._id });

    const enrollmentDocs = subjectIds.map((subjectId) => ({
      studentId: user._id,
      subjectId,
      enrolledBy: user._id,
      status: 'active',
    }));

    await StudentSubjectEnrollment.insertMany(enrollmentDocs, { ordered: false });

    return sendSuccess(
      res,
      {
        enrollments: enrollmentDocs,
        count: enrollmentDocs.length,
      },
      'Student subjects saved successfully',
      constants.HTTP_STATUS.CREATED,
    );
  } catch (error) {
    logger.error('Error saving student subject enrollments', { error: error.message });
    next(error);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await StudentSubjectEnrollment.find({ studentId: req.user._id, status: 'active' })
      .populate('subjectId', 'name code department description')
      .lean();

    return sendSuccess(res, { enrollments, total: enrollments.length }, 'Student enrollments retrieved successfully');
  } catch (error) {
    logger.error('Error fetching student enrollments', { error: error.message });
    next(error);
  }
};

module.exports = {
  getEligibleSubjects,
  saveStudentSubjectEnrollments,
  getMyEnrollments,
};
