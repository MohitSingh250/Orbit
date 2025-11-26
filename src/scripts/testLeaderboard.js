require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const ContestProblem = require('../models/ContestProblem');
const Submission = require('../models/Submission');

async function testLeaderboard() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('🚀 Starting Leaderboard Test...');

    // 1. Create a Test User
    const email = `test_leaderboard_${Date.now()}@example.com`;
    const user = await User.create({
      username: `tester_${Date.now()}`,
      email,
      passwordHash: 'hash',
      roles: ['user']
    });
    console.log(`👤 Created User: ${user.username} (${user._id})`);

    // 2. Create a Test Contest
    const contest = await Contest.create({
      contestNumber: Math.floor(Math.random() * 10000),
      title: 'Leaderboard Test Contest',
      startTime: new Date(Date.now() - 10000), // Started 10s ago
      endTime: new Date(Date.now() + 3600000), // Ends in 1h
      participants: []
    });
    console.log(`🏆 Created Contest: ${contest.title} (${contest._id})`);

    // 3. Create a Test Problem
    const problem = await ContestProblem.create({
      contestId: contest._id,
      title: 'Test Problem',
      statement: 'Test Statement',
      correctAnswer: 'A',
      points: 10,
      inputType: 'mcq_single'
    });
    contest.problems.push(problem._id);
    await contest.save();
    console.log(`❓ Created Problem: ${problem.title} (${problem._id})`);

    // 4. Register User
    contest.participants.push({ userId: user._id });
    await contest.save();
    console.log('📝 User Registered');

    // 5. Submit Answer (Simulating submissionController logic)
    console.log('📨 Submitting Answer...');
    
    // Re-fetch contest to ensure we have latest version
    const contestForSubmit = await Contest.findById(contest._id);
    const participant = contestForSubmit.participants.find(p => String(p.userId) === String(user._id));
    
    if (!participant) {
      console.error('❌ Participant not found in contest!');
      process.exit(1);
    }

    // Simulate correct submission
    participant.score += 10;
    participant.solved += 1;
    participant.lastSubmissionAt = new Date();
    participant.isSubmitted = true;

    // Mark the participants array as modified (Critical check)
    // Mongoose should detect this, but let's see if this is the issue
    // contestForSubmit.markModified('participants'); 

    await contestForSubmit.save();
    console.log('✅ Submission Processed (Simulated)');

    // 6. Fetch Leaderboard (Simulating leaderboardController logic)
    console.log('📊 Fetching Leaderboard...');
    const contestForLeaderboard = await Contest.findById(contest._id)
      .populate('participants.userId', 'username')
      .lean();

    const entry = contestForLeaderboard.participants.find(p => String(p.userId._id) === String(user._id));

    if (entry && entry.score === 10) {
      console.log('✅ SUCCESS: Leaderboard updated correctly!');
      console.log('Entry:', entry);
    } else {
      console.error('❌ FAILURE: Leaderboard NOT updated!');
      console.log('Entry found:', entry);
    }

    // Cleanup
    await User.deleteOne({ _id: user._id });
    await Contest.deleteOne({ _id: contest._id });
    await ContestProblem.deleteOne({ _id: problem._id });
    
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testLeaderboard();
