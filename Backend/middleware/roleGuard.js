/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based authorization per SRS 4.1
 * Supported roles: admin, teacher, student
 */

const { sendError } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Role guard factory
 * Returns middleware that checks if user has required role(s)
 * @param {...string} allowedRoles - One or more roles (e.g., 'admin', 'teacher')
 * @returns {function} - Express middleware
 */
const roleGuard = (...allowedRoles) => {
  // Flatten in case caller passes an array instead of spread args
  // e.g., roleGuard(['admin']) → allowedRoles = [['admin']] → flatten to ['admin']
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      logger.warn('Role guard: User not authenticated');
      return sendError(
        res,
        'User not authenticated',
        'UNAUTHORIZED',
        [],
        401
      );
    }

    const userRole = req.user.role;

    // Check if user's role is in allowed roles
    if (!roles.includes(userRole)) {
      logger.warn(
        `Role guard: User ${req.user.userId} with role '${userRole}' attempted to access resource requiring roles: [${roles.join(', ')}]`
      );

      return sendError(
        res,
        `Insufficient permissions. Required roles: ${roles.join(', ')}`,
        'FORBIDDEN',
        [{ field: 'role', message: `User role '${userRole}' not allowed` }],
        403
      );
    }

    logger.debug(`Role guard: User ${req.user.userId} authorized with role '${userRole}'`);
    next();
  };
};

/**
 * Admin role guard
 * Only admin users can access
 */
const adminOnly = roleGuard('admin');

/**
 * Teacher role guard
 * Only teachers and admins can access
 */
const teacherOnly = roleGuard('teacher', 'admin');

/**
 * Student role guard
 * Only students can access (typically used rarely)
 */
const studentOnly = roleGuard('student');

/**
 * Multiple role guard
 * Access multiple roles simultaneously
 */
const multiRoleGuard = {
  admin: adminOnly,
  teacher: teacherOnly,
  student: studentOnly,
  adminOrTeacher: roleGuard('admin', 'teacher'),
  all: (req, res, next) => next(), // Allow all authenticated users
};

module.exports = {
  roleGuard,
  adminOnly,
  teacherOnly,
  studentOnly,
  multiRoleGuard,
};
