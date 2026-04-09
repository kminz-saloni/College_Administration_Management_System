/**
 * Seed & Unlock Script - run from Backend/ directory
 */

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const AuthService = require('./services/authService');

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!\n');

  // 1. Unlock all locked accounts
  const unlockResult = await User.updateMany(
    { loginAttempts: { $gt: 0 } },
    {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
      },
    }
  );
  console.log(`Unlocked ${unlockResult.modifiedCount} account(s)\n`);

  // 2. Ensure test users exist
  const testUsers = [
    { name: 'Test Student', email: 'student@college.edu', role: 'student', password: 'Test@1234' },
    { name: 'Test Student Two', email: 'student2@college.edu', role: 'student', password: 'Test@1234' },
    { name: 'Test Teacher', email: 'testteacher@college.edu', role: 'teacher', password: 'Test@1234' },
    { name: 'System Admin', email: 'admin@college.edu', role: 'admin', password: 'Admin@1234' },
  ];

  for (const u of testUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`[EXISTS] ${u.role}: ${u.email}`);
      existing.password = await AuthService.hashPassword(u.password);
      existing.loginAttempts = 0;
      existing.lockUntil = null;
      existing.isEmailVerified = true;
      await existing.save();
      console.log(`         Password reset & unlocked.`);
    } else {
      const hashed = await AuthService.hashPassword(u.password);
      await User.create({
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role,
        isEmailVerified: true,
      });
      console.log(`[CREATED] ${u.role}: ${u.email}`);
    }
  }

  console.log('\nSeed complete!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
