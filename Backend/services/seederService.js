/**
 * Seeder Service
 * Handles database seeding operations
 */

const Subject = require('../models/Subject');
const Department = require('../models/Department');
const Semester = require('../models/Semester');
const Section = require('../models/Section');
const logger = require('../utils/logger');

const defaultSubjects = [
  {
    name: 'Data Structures',
    code: 'CS101',
    description: 'Fundamentals of data structures and algorithms',
    department: 'Computer Science',
  },
  {
    name: 'Web Development',
    code: 'CS102',
    description: 'Modern web development using MERN stack',
    department: 'Computer Science',
  },
  {
    name: 'Database Management',
    code: 'CS103',
    description: 'SQL and NoSQL databases, MongoDB, PostgreSQL',
    department: 'Computer Science',
  },
  {
    name: 'Object Oriented Programming',
    code: 'CS104',
    description: 'OOP concepts using Java and Python',
    department: 'Computer Science',
  },
  {
    name: 'Web Design',
    code: 'CS105',
    description: 'UI/UX Design and Frontend Technologies',
    department: 'Computer Science',
  },
  {
    name: 'Mathematics - Calculus',
    code: 'MATH101',
    description: 'Differential and Integral Calculus',
    department: 'Mathematics',
  },
  {
    name: 'Physics - Mechanics',
    code: 'PHY101',
    description: 'Classical Mechanics and Motion',
    department: 'Physics',
  },
  {
    name: 'Chemistry - General',
    code: 'CHEM101',
    description: 'General Chemistry and Atomic Structure',
    department: 'Chemistry',
  },
  {
    name: 'English Literature',
    code: 'ENG101',
    description: 'British and American Literature',
    department: 'English',
  },
  {
    name: 'History',
    code: 'HIST101',
    description: 'World History and Ancient Civilizations',
    department: 'History',
  },
];

const defaultDepartments = [
  { name: 'Computer Science', code: 'CSE' },
  { name: 'Mathematics', code: 'MATH' },
  { name: 'Physics', code: 'PHY' },
  { name: 'Chemistry', code: 'CHEM' },
  { name: 'English', code: 'ENG' },
  { name: 'History', code: 'HIST' },
];

const defaultSemesters = [
  { name: 'Semester 1', code: 'S1', order: 1 },
  { name: 'Semester 2', code: 'S2', order: 2 },
  { name: 'Semester 3', code: 'S3', order: 3 },
  { name: 'Semester 4', code: 'S4', order: 4 },
  { name: 'Semester 5', code: 'S5', order: 5 },
  { name: 'Semester 6', code: 'S6', order: 6 },
  { name: 'Semester 7', code: 'S7', order: 7 },
  { name: 'Semester 8', code: 'S8', order: 8 },
];

const defaultSections = [
  { name: 'Section A', code: 'A' },
  { name: 'Section B', code: 'B' },
  { name: 'Section C', code: 'C' },
];

/**
 * Seed default subjects into database
 * @returns {Promise<Array>} - Array of created subjects
 */
const seedSubjects = async () => {
  try {
    // Check if subjects already exist
    const existingCount = await Subject.countDocuments({ isActive: true });

    if (existingCount > 0) {
      logger.info(`Subjects already seeded: ${existingCount} subjects found`);
      return [];
    }

    // Insert default subjects
    const createdSubjects = await Subject.insertMany(
      defaultSubjects.map((subject) => ({
        ...subject,
        isActive: true,
      })),
    );

    logger.info(`Seeded ${createdSubjects.length} default subjects`);
    return createdSubjects;
  } catch (error) {
    logger.error('Error seeding subjects', { error: error.message });
    throw error;
  }
};

const seedCampusLookups = async () => {
  const seeds = [
    { Model: Department, items: defaultDepartments, label: 'departments' },
    { Model: Semester, items: defaultSemesters, label: 'semesters' },
    { Model: Section, items: defaultSections, label: 'sections' },
  ];

  await Promise.all(seeds.map(async (seed) => {
    const existingCount = await seed.Model.countDocuments({ deletedAt: null });
    if (existingCount > 0) {
      logger.info(`${seed.label} already seeded: ${existingCount} records found`);
      return;
    }

    await seed.Model.insertMany(seed.items.map((item) => ({ ...item, isActive: true })));
    logger.info(`Seeded ${seed.items.length} default ${seed.label}`);
  }));
};

module.exports = {
  seedSubjects,
  seedCampusLookups,
  defaultSubjects,
  defaultDepartments,
  defaultSemesters,
  defaultSections,
};
