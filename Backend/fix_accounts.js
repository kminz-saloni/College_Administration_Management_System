/**
 * Fix accounts - unlock and set correct passwords using bcrypt directly
 * Run from Backend/ directory
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Connecting...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!\n');

  const db = mongoose.connection.db;
  const users = db.collection('users');

  const testAccounts = [
    { email: 'student@college.edu',      password: 'Test@1234',  role: 'student' },
    { email: 'student2@college.edu',     password: 'Test@1234',  role: 'student' },
    { email: 'testteacher@college.edu',  password: 'Test@1234',  role: 'teacher' },
    { email: 'admin@college.edu',        password: 'Admin@1234', role: 'admin'   },
  ];

  for (const acct of testAccounts) {
    const hashed = await bcrypt.hash(acct.password, 10);

    const existing = await users.findOne({ email: acct.email });
    if (existing) {
      // Directly update the MongoDB document to bypass pre-save hooks
      const result = await users.updateOne(
        { email: acct.email },
        {
          $set: {
            password: hashed,
            loginAttempts: 0,
            lockUntil: null,
            isActive: true,
            emailVerified: true,
          },
        }
      );
      console.log(`[FIXED] ${acct.email} — modified: ${result.modifiedCount}`);
    } else {
      // Create new user with hashed password
      await users.insertOne({
        name: `Test ${acct.role.charAt(0).toUpperCase() + acct.role.slice(1)}`,
        email: acct.email,
        password: hashed,
        role: acct.role,
        isActive: true,
        emailVerified: true,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[CREATED] ${acct.email}`);
    }
  }

  // Show current state
  console.log('\n--- Current DB State ---');
  const docs = await users.find({ email: { $in: testAccounts.map(a => a.email) } }, { projection: { email:1, role:1, loginAttempts:1, lockUntil:1, isActive:1 } }).toArray();
  docs.forEach(d => console.log(`  ${d.email} | role:${d.role} | attempts:${d.loginAttempts} | lock:${d.lockUntil} | active:${d.isActive}`));
  
  await mongoose.disconnect();
  console.log('\nDone!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
