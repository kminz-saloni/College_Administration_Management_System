require('dotenv').config();

const mongoose = require('mongoose');
const Class = require('../models/Class');
const TeacherSubjectAssignment = require('../models/TeacherSubjectAssignment');
const StudentSubjectEnrollment = require('../models/StudentSubjectEnrollment');
const Attendance = require('../models/Attendance');
const Video = require('../models/Video');

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const [
    classResult,
    teacherAssignmentResult,
    enrollmentResult,
    attendanceResult,
    videoResult,
  ] = await Promise.all([
    Class.deleteMany({}),
    TeacherSubjectAssignment.deleteMany({}),
    StudentSubjectEnrollment.deleteMany({}),
    Attendance.deleteMany({}),
    Video.deleteMany({}),
  ]);

  console.log('Class data reset complete');
  console.log(`Classes removed: ${classResult.deletedCount}`);
  console.log(`Teacher assignments removed: ${teacherAssignmentResult.deletedCount}`);
  console.log(`Student enrollments removed: ${enrollmentResult.deletedCount}`);
  console.log(`Attendance records removed: ${attendanceResult.deletedCount}`);
  console.log(`Videos removed: ${videoResult.deletedCount}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
