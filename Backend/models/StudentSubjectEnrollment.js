const mongoose = require('mongoose');

const studentSubjectEnrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
      index: true,
    },
    enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'dropped'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'student_subject_enrollments',
  },
);

studentSubjectEnrollmentSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('StudentSubjectEnrollment', studentSubjectEnrollmentSchema);
