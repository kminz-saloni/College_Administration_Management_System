/**
 * Dashboard Controller
 * Handles dashboard statistics and role-based dashboard data
 * Phase 3: Dashboard & User Management
 */

const User = require('../models/User');
const Class = require('../models/Class');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const constants = require('../config/constants');

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get overall dashboard statistics
 * GET /dashboard/stats
 * Admin only - Get system-wide statistics
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getDashboardStats = async (req, res, next) => {
  try {
    logger.info('Fetching dashboard statistics', { requestedBy: req.user._id });

    // Get total users by role
    const usersByRole = await User.aggregate([
      {
        $match: {
          isActive: true,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format user counts
    const userCounts = {
      admin: 0,
      teacher: 0,
      student: 0,
    };

    usersByRole.forEach((item) => {
      userCounts[item._id] = item.count;
    });

    const totalUsers = userCounts.admin + userCounts.teacher + userCounts.student;

    // Get total classes
    const totalClasses = await Class.countDocuments({
      isActive: true,
      deletedAt: null,
    });

    // Get total students enrolled across all classes
    const classesData = await Class.aggregate([
      {
        $match: {
          isActive: true,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: '$studentCount' },
          activeClasses: { $sum: 1 },
          averageStudentsPerClass: { $avg: '$studentCount' },
        },
      },
    ]);

    const classStats = classesData[0] || {
      totalEnrollments: 0,
      activeClasses: 0,
      averageStudentsPerClass: 0,
    };

    logger.info('Dashboard statistics retrieved', {
      totalUsers,
      totalClasses,
      userCounts,
    });

    return sendSuccess(res, {
      totalUsers,
      usersByRole: {
        admin: userCounts.admin,
        teacher: userCounts.teacher,
        student: userCounts.student,
      },
      totalClasses: classStats.activeClasses,
      totalEnrollments: classStats.totalEnrollments || 0,
      averageStudentsPerClass: Math.round(classStats.averageStudentsPerClass || 0),
      systemHealth: {
        dbStatus: 'healthy',
        apiStatus: 'operational',
      },
      timestamp: new Date().toISOString(),
    }, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching dashboard statistics', { error: error.message });
    next(error);
  }
};

// ============================================
// ROLE-BASED DASHBOARDS
// ============================================

/**
 * Get admin dashboard data
 * GET /dashboard/admin
 * Admin only
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    logger.info('Fetching admin dashboard', { adminId: req.user._id });

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $match: {
          isActive: true,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const userCounts = { admin: 0, teacher: 0, student: 0 };
    userStats.forEach((item) => {
      userCounts[item._id] = item.count;
    });

    // Get active classes
    const activeClasses = await Class.countDocuments({
      isActive: true,
      deletedAt: null,
    });

    // Get recent users (last 10)
    const recentUsers = await User.find({
      isActive: true,
      deletedAt: null,
    })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get classes with most students
    const topClasses = await Class.find({
      isActive: true,
      deletedAt: null,
    })
      .select('name subject teacher teacherName studentCount')
      .sort({ studentCount: -1 })
      .limit(5)
      .lean();

    logger.info('Admin dashboard retrieved successfully', { adminId: req.user._id });

    return sendSuccess(res, {
      summary: {
        totalUsers: userCounts.admin + userCounts.teacher + userCounts.student,
        totalAdmins: userCounts.admin,
        totalTeachers: userCounts.teacher,
        totalStudents: userCounts.student,
        activeClasses,
      },
      recentUsers: recentUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt,
      })),
      topClasses: topClasses.map((cls) => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        students: cls.studentCount,
      })),
      timestamp: new Date().toISOString(),
    }, 'Admin dashboard retrieved successfully');
  } catch (error) {
    logger.error('Error fetching admin dashboard', { error: error.message });
    next(error);
  }
};

/**
 * Get teacher dashboard data
 * GET /dashboard/teacher
 * Teacher only - Get data about their classes and students
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getTeacherDashboard = async (req, res, next) => {
  try {
    logger.info('Fetching teacher dashboard', { teacherId: req.user._id });

    // Get teacher's classes
    const myClasses = await Class.find({
      teacher: req.user._id,
      isActive: true,
      deletedAt: null,
    })
      .select('name subject studentCount schedule')
      .lean();

    // Get total students taught
    const classesData = await Class.aggregate([
      {
        $match: {
          teacher: req.user._id,
          isActive: true,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: '$studentCount' },
          totalClasses: { $sum: 1 },
        },
      },
    ]);

    const stats = classesData[0] || { totalStudents: 0, totalClasses: 0 };

    logger.info('Teacher dashboard retrieved successfully', {
      teacherId: req.user._id,
      classCount: stats.totalClasses,
    });

    return sendSuccess(res, {
      summary: {
        myClasses: stats.totalClasses,
        myStudents: stats.totalStudents || 0,
      },
      classes: myClasses.map((cls) => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        students: cls.studentCount,
        schedule: cls.schedule || {},
      })),
      timestamp: new Date().toISOString(),
    }, 'Teacher dashboard retrieved successfully');
  } catch (error) {
    logger.error('Error fetching teacher dashboard', { error: error.message });
    next(error);
  }
};

/**
 * Get student dashboard data
 * GET /dashboard/student
 * Student only - Get data about their classes and performance
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    logger.info('Fetching student dashboard', { studentId: req.user._id });

    // Get classes the student is enrolled in
    const myClasses = await Class.find({
      students: req.user._id,
      isActive: true,
      deletedAt: null,
    })
      .select('name subject teacher teacherName schedule')
      .populate('teacher', 'name email')
      .lean();

    // Get class statistics
    const classCount = myClasses.length;

    logger.info('Student dashboard retrieved successfully', {
      studentId: req.user._id,
      classCount,
    });

    return sendSuccess(res, {
      summary: {
        enrolledClasses: classCount,
      },
      classes: myClasses.map((cls) => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        teacher: cls.teacher ? {
          id: cls.teacher._id,
          name: cls.teacher.name,
          email: cls.teacher.email,
        } : null,
        schedule: cls.schedule || {},
      })),
      timestamp: new Date().toISOString(),
    }, 'Student dashboard retrieved successfully');
  } catch (error) {
    logger.error('Error fetching student dashboard', { error: error.message });
    next(error);
  }
};

/**
 * Get classes list (role-filtered)
 * GET /dashboard/classes
 * - Students: their enrolled classes
 * - Admin/Teacher: all active classes
 */
const getDashboardClasses = async (req, res, next) => {
  try {
    const role = req.user.role;

    let classes;
    if (role === constants.ROLES.STUDENT) {
      // Students see only their enrolled classes
      classes = await Class.find({
        students: req.user.userId,
        isActive: true,
        deletedAt: null,
      })
        .select('name subject teacher teacherName schedule studentCount')
        .populate('teacher', 'name email')
        .lean();
    } else if (role === constants.ROLES.TEACHER) {
      // Teachers see only their own classes
      classes = await Class.find({
        teacher: req.user._id,
        isActive: true,
        deletedAt: null,
      })
        .select('name subject teacher teacherName schedule studentCount')
        .populate('teacher', 'name email')
        .lean();
    } else {
      // Admin sees all classes
      classes = await Class.find({ isActive: true, deletedAt: null })
        .select('name subject teacher teacherName schedule studentCount')
        .populate('teacher', 'name email')
        .lean();
    }

    return sendSuccess(res, {
      classes: classes.map((cls) => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        students: cls.studentCount || 0,
        teacher: cls.teacher
          ? { id: cls.teacher._id, name: cls.teacher.name }
          : { name: cls.teacherName || 'Unknown' },
        schedule: cls.schedule || {},
      })),
      total: classes.length,
    }, 'Classes retrieved successfully');
  } catch (error) {
    logger.error('Error fetching classes', { error: error.message });
    next(error);
  }
};

/**
 * Get users list (admin/teacher)
 * GET /dashboard/users
 */
const getDashboardUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isActive: true, deletedAt: null };

    // For teachers, only show students in their classes
    if (req.user.role === constants.ROLES.TEACHER) {
      // Get all student IDs from teacher's classes
      const teacherClasses = await Class.find({ teacher: req.user._id })
        .select('students')
        .lean();
      
      const studentIds = [];
      teacherClasses.forEach((cls) => {
        if (cls.students && Array.isArray(cls.students)) {
          studentIds.push(...cls.students);
        }
      });

      // Teachers can only see students from their classes
      if (studentIds.length > 0) {
        filter._id = { $in: studentIds };
        filter.role = constants.ROLES.STUDENT;
      } else {
        // If teacher has no classes, return empty result
        filter._id = { $in: [] };
      }
    } else {
      // Admin can filter by role if provided
      if (role) filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role department designation lastLogin createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      users: users.map((u) => ({
        _id: u._id,
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        designation: u.designation,
        lastLogin: u.lastLogin,
        joinedAt: u.createdAt,
        isActive: true,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    }, 'Users retrieved successfully');
  } catch (error) {
    logger.error('Error fetching users', { error: error.message });
    next(error);
  }
};

/**
 * Get reports data (admin)
 * GET /dashboard/reports
 */
const getDashboardReports = async (req, res, next) => {
  try {
    const [totalUsers, totalClasses] = await Promise.all([
      User.countDocuments({ isActive: true, deletedAt: null }),
      Class.countDocuments({ isActive: true, deletedAt: null }),
    ]);

    const usersByRole = await User.aggregate([
      { $match: { isActive: true, deletedAt: null } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const roleCounts = { admin: 0, teacher: 0, student: 0 };
    usersByRole.forEach((r) => { roleCounts[r._id] = r.count; });

    return sendSuccess(res, {
      summary: {
        totalUsers,
        totalClasses,
        usersByRole: roleCounts,
      },
      generatedAt: new Date().toISOString(),
    }, 'Reports retrieved successfully');
  } catch (error) {
    logger.error('Error fetching reports', { error: error.message });
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getDashboardClasses,
  getDashboardUsers,
  getDashboardReports,
};
