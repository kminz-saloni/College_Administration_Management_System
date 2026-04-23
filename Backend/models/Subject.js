/**
 * Subject Model
 * MongoDB schema for managing subjects/courses
 * Per SRS 4.2 & 4.3: Subject-wise video streaming and teacher assignment
 */

const mongoose = require('mongoose');

// ============================================
// SUBJECT SCHEMA DEFINITION
// ============================================

const subjectSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 20,
      index: true,
    },

    description: {
      type: String,
      optional: true,
      maxlength: 500,
    },

    department: {
      type: String,
      optional: true,
      trim: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
    collection: 'subjects',
  }
);

// ============================================
// INDEXES
// ============================================

// Compound index for active subjects
subjectSchema.index({ isActive: 1, createdAt: -1 });

// Index for soft delete
subjectSchema.index({ deletedAt: 1 });

// ============================================
// EXPORT
// ============================================

module.exports = mongoose.model('Subject', subjectSchema);
