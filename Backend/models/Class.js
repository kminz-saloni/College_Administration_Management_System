/**
 * Class Model
 * MongoDB schema for managing classes
 * Per SRS 2.2: System enables Teacher-driven class management
 */

const mongoose = require('mongoose');
// ============================================
// CLASS SCHEMA DEFINITION
// ============================================

const classSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    classCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    description: {
      type: String,
      optional: true,
      maxlength: 500,
    },

    // Teacher Information
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },

    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      default: null,
      index: true,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
      index: true,
    },

    teacherName: {
      type: String,
      optional: true, // Denormalized for quick access
    },

    // Class Schedule
    schedule: {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        optional: true,
      },
      startTime: {
        type: String, // Format: HH:MM (24-hour)
        optional: true,
      },
      endTime: {
        type: String, // Format: HH:MM (24-hour)
        optional: true,
      },
      room: {
        type: String,
        optional: true,
      },
    },

    // Student Enrollment
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    studentCount: {
      type: Number,
      default: 0,
      index: true,
    },

    // Class Status & Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },

    academicYear: {
      type: String,
      optional: true, // Format: "2025-2026"
      index: true,
    },

    semester: {
      type: String,
      optional: true, // e.g., "1", "2"
    },

    maxCapacity: {
      type: Number,
      default: 50,
    },

    capacity: {
      type: Number,
      default: 50,
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    deletedAt: {
      type: Date,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'classes',
  },
);

// ============================================
// INDEXES
// ============================================

// Compound index for teacher + subject queries
classSchema.index({ teacher: 1, subject: 1 });

classSchema.index({ classCode: 1 }, { unique: true, sparse: true });
classSchema.index(
  {
    teacher: 1,
    subjectId: 1,
    semesterId: 1,
    sectionId: 1,
    academicYear: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

// Index for active classes
classSchema.index({ isActive: 1, createdAt: -1 });

// Index for academic year lookups
classSchema.index({ academicYear: 1, semester: 1 });

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find class by ID (for quick access)
 * @param {string} classId - Class ID
 * @returns {Promise<Object>}
 */
classSchema.statics.findById = function (classId) {
  return this.findOne({
    _id: classId,
    deletedAt: null,
  });
};

/**
 * Find all classes taught by a teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>}
 */
classSchema.statics.findByTeacher = function (teacherId) {
  return this.find({
    teacher: teacherId,
    isActive: true,
    deletedAt: null,
  }).populate('teacher', 'name email');
};

/**
 * Find all classes filtered by subject
 * @param {string} subject - Subject name
 * @returns {Promise<Array>}
 */
classSchema.statics.findBySubject = function (subject) {
  return this.find({
    subject: new RegExp(subject, 'i'),
    isActive: true,
    deletedAt: null,
  });
};

/**
 * Find classes by academic year
 * @param {string} academicYear - Academic year (e.g., "2025-2026")
 * @returns {Promise<Array>}
 */
classSchema.statics.findByAcademicYear = function (academicYear) {
  return this.find({
    academicYear,
    isActive: true,
    deletedAt: null,
  });
};

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Add student to class
 * @param {string} studentId - Student ID
 * @returns {Promise}
 */
classSchema.methods.addStudent = async function (studentId) {
  if (this.students.includes(studentId)) {
    throw new Error('Student is already enrolled in this class');
  }

  if (this.students.length >= this.capacity) {
    throw new Error('Class is full. Cannot add more students.');
  }

  this.students.push(studentId);
  this.studentCount = this.students.length;
  return this.save();
};

/**
 * Remove student from class
 * @param {string} studentId - Student ID
 * @returns {Promise}
 */
classSchema.methods.removeStudent = async function (studentId) {
  if (!this.students.includes(studentId)) {
    throw new Error('Student is not enrolled in this class');
  }

  this.students = this.students.filter((id) => id.toString() !== studentId.toString());
  this.studentCount = this.students.length;
  return this.save();
};

/**
 * Check if student is enrolled
 * @param {string} studentId - Student ID
 * @returns {boolean}
 */
classSchema.methods.isStudentEnrolled = function (studentId) {
  return this.students.includes(studentId);
};

/**
 * Soft delete class
 * @returns {Promise}
 */
classSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

/**
 * Restore soft deleted class
 * @returns {Promise}
 */
classSchema.methods.restore = async function () {
  this.deletedAt = null;
  this.isActive = true;
  return this.save();
};

// ============================================
// MODELS
// ============================================

module.exports = mongoose.model('Class', classSchema);
