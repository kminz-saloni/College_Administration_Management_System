/**
 * Subjects Seed Data
 * MongoDB Subject Seeding Script
 * USAGE: mongosh < seed-subjects.js
 * Run this AFTER the system is initialized to populate default subjects
 */

db = db.getSiblingDB("college_admin");

console.log("=== Seeding Subjects ===\n");

// Default subjects for the college
const subjects = [
  {
    name: "Data Structures",
    code: "CS101",
    description: "Fundamentals of data structures and algorithms",
    department: "Computer Science",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Web Development",
    code: "CS102",
    description: "Modern web development using MERN stack",
    department: "Computer Science",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Database Management",
    code: "CS103",
    description: "SQL and NoSQL databases, MongoDB, PostgreSQL",
    department: "Computer Science",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Object Oriented Programming",
    code: "CS104",
    description: "OOP concepts using Java and Python",
    department: "Computer Science",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Web Design",
    code: "CS105",
    description: "UI/UX Design and Frontend Technologies",
    department: "Computer Science",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Mathematics - Calculus",
    code: "MATH101",
    description: "Differential and Integral Calculus",
    department: "Mathematics",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Physics - Mechanics",
    code: "PHY101",
    description: "Classical Mechanics and Motion",
    department: "Physics",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Chemistry - General",
    code: "CHEM101",
    description: "General Chemistry and Atomic Structure",
    department: "Chemistry",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "English Literature",
    code: "ENG101",
    description: "British and American Literature",
    department: "English",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "History",
    code: "HIST101",
    description: "World History and Ancient Civilizations",
    department: "History",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];

try {
  const result = db.subjects.insertMany(subjects);
  console.log(`✓ Successfully inserted ${result.insertedIds.length} subjects`);
  console.log(`Inserted IDs: ${JSON.stringify(result.insertedIds)}`);
} catch (error) {
  console.error("✗ Error inserting subjects:", error.message);
}

console.log("\n=== Subjects Seeding Complete ===");
