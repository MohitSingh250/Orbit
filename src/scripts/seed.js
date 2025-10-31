require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');

async function seed() {
  await connectDB(process.env.MONGO_URI);

  console.log('🚀 Starting database seeding...');

  // --- Clear existing data ---
  await User.deleteMany({});
  await Problem.deleteMany({});
  await Submission.deleteMany({});
  await Contest.deleteMany({});
  console.log('🧹 Cleared old collections');

  // --- Create admin ---
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await User.create({
    username: 'admin',
    email: adminEmail,
    passwordHash: adminHash,
    roles: ['admin'],
    rating: 2000,
    currentStreak: 10,
    longestStreak: 25,
  });
  console.log('✅ Admin created:', adminEmail);

  // --- Create users ---
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const hash = await bcrypt.hash(`Password${i}`, 10);
    const user = await User.create({
      username: `user${i}`,
      email: `user${i}@example.com`,
      passwordHash: hash,
      roles: ['student'],
      rating: 1200 + Math.floor(Math.random() * 300),
      currentStreak: Math.floor(Math.random() * 10),
      longestStreak: Math.floor(Math.random() * 20),
      solvedProblems: [],
      notes: [],
      bookmarks: []
    });
    users.push(user);
    console.log(`👤 Created user: ${user.username}`);
  }

  // --- Create problems ---
  const topics = ['Mechanics', 'Waves', 'Optics', 'Electricity', 'Thermodynamics', 'Math', 'CS'];
  const difficulties = ['easy', 'medium', 'hard'];
  const problems = [];

  for (let i = 1; i <= 30; i++) {
    const title = `Problem #${i}`;
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const inputType = Math.random() < 0.5 ? 'mcq_single' : 'numeric';
    const correctAnswer = inputType === 'mcq_single'
      ? ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
      : (Math.random() * 10).toFixed(2);

    const problem = await Problem.create({
      title,
      statement: `This is the problem statement for ${title}.`,
      topics: [topic],
      tags: ['practice', 'seed'],
      difficulty,
      inputType,
      points: Math.floor(Math.random() * 5) + 1,
      options: inputType === 'mcq_single'
        ? [
            { id: 'A', text: 'Option A' },
            { id: 'B', text: 'Option B' },
            { id: 'C', text: 'Option C' },
            { id: 'D', text: 'Option D' }
          ]
        : [],
      correctAnswer
    });

    problems.push(problem);
    console.log(`📘 Created problem: ${problem.title}`);
  }

  // --- Create submissions + solvedProblems for users ---
  for (const user of users) {
    for (let j = 0; j < 5; j++) {
      const problem = problems[Math.floor(Math.random() * problems.length)];
      const verdicts = ['Accepted', 'Wrong Answer', 'Partial'];
      const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      const isCorrect = verdict === 'Accepted';

      await Submission.create({
        userId: user._id,
        problemId: problem._id,
        answer: isCorrect ? problem.correctAnswer : 'Wrong',
        verdict,
        isCorrect,
        score: isCorrect ? problem.points : 0,
        timeTakenMs: Math.floor(Math.random() * 20000),
        createdAt: new Date()
      });

      // Update user's solved problems if correct
      if (isCorrect) {
        user.solvedProblems.push({
          problemId: problem._id,
          solvedAt: new Date()
        });
      }
    }

    // Add notes + bookmarks
    const bookmarkedProblem = problems[Math.floor(Math.random() * problems.length)];
    user.notes.push({
      problemId: bookmarkedProblem._id,
      note: `This is a note for ${bookmarkedProblem.title}`,
      createdAt: new Date()
    });
    user.bookmarks.push(bookmarkedProblem._id);

    await user.save();
    console.log(`🧩 Added solved problems + notes for ${user.username}`);
  }

  console.log('📝 Created user submissions');

  // --- Create contests ---
  for (let i = 1; i <= 3; i++) {
    const contestProblems = problems.slice(i * 5, i * 5 + 5);
    const startTime = new Date(Date.now() + i * 86400000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const contest = await Contest.create({
      title: `Contest #${i}`,
      problems: contestProblems.map(p => p._id),
      startTime,
      endTime,
      participants: users.map(u => u._id)
    });

    console.log(`🏆 Created contest: ${contest.title}`);
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
