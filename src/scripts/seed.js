require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Problem = require('../models/Problem');

async function seed() {
  await connectDB(process.env.MONGO_URI);

  // create admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPassword, salt);
    admin = await User.create({ username: 'admin', email: adminEmail, passwordHash: hash, roles: ['admin'] });
    console.log('Admin created', adminEmail);
  } else {
    console.log('Admin already exists');
  }

  // sample problems
  const sample = [
    {
      title: 'Block on a rough inclined plane',
      statement: 'A block of mass m slides ... (LaTeX allowed)',
      topic: 'Mechanics',
      difficulty: 'medium',
      inputType: 'mcq_single',
      options: [{id: 'A', text: 'Something'}, {id: 'B', text: 'Something else'}],
      correctAnswer: 'A',
      points: 2
    },
    {
      title: 'Wavelength calculation',
      statement: 'Calculate the wavelength given frequency f and speed v',
      topic: 'Waves',
      difficulty: 'easy',
      inputType: 'numeric',
      correctAnswer: 0.5,
      numericTolerance: 1e-2,
      points: 1
    }
  ];

  for (const p of sample) {
    const exists = await Problem.findOne({ title: p.title });
    if (!exists) {
      await Problem.create(p);
      console.log('Created problem:', p.title);
    }
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
