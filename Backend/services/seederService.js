/**
 * Seeder Service
 * Handles database seeding operations
 */

const Subject = require('../models/Subject');
const logger = require('../utils/logger');

const defaultSubjects = [
  {
    name: "Data Structures",
    code: "CS101",
    description: "Fundamentals of data structures and algorithms",
    department: "Computer Science",
  },
  {
    name: "Web Development",
    code: "CS102",
    description: "Modern web development using MERN stack",
    department: "Computer Science",
  },
  {
    name: "Database Management",
    code: "CS103",
    description: "SQL and NoSQL databases, MongoDB, PostgreSQL",
    department: "Computer Science",
  },
  {
    name: "Object Oriented Programming",
    code: "CS104",
    description: "OOP concepts using Java and Python",
    department: "Computer Science",
  },
  {
    name: "Web Design",
    code: "CS105",
    description: "UI/UX Design and Frontend Technologies",
    department: "Computer Science",
  },
  {
    name: "Mathematics - Calculus",
    code: "MATH101",
    description: "Differential and Integral Calculus",
    department: "Mathematics",
  },
  {
    name: "Physics - Mechanics",
    code: "PHY101",
    description: "Classical Mechanics and Motion",
    department: "Physics",
  },
  {
    name: "Chemistry - General",
    code: "CHEM101",
    description: "General Chemistry and Atomic Structure",
    department: "Chemistry",
  },
  {
    name: "English Literature",
    code: "ENG101",
    description: "British and American Literature",
    department: "English",
  },
  {
    name: "History",
    code: "HIST101",
    description: "World History and Ancient Civilizations",
    department: "History",
  },
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
      defaultSubjects.map(subject => ({
        ...subject,
        isActive: true,
      }))
    );

    logger.info(`Seeded ${createdSubjects.length} default subjects`);
    return createdSubjects;
  } catch (error) {
    logger.error('Error seeding subjects', { error: error.message });
    throw error;
  }
};

module.exports = {
  seedSubjects,
  defaultSubjects,
};
