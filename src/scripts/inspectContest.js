require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Contest = require('../models/Contest');
const User = require('../models/User');

const contestTitle = process.argv[2] || 'practice';

async function inspectContest() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(`🔍 Searching for contest with title containing: "${contestTitle}"`);

    const contests = await Contest.find({ title: { $regex: contestTitle, $options: 'i' } })
      .populate('participants.userId', 'username email')
      .lean();

    if (contests.length === 0) {
      console.log('❌ No contest found.');
      process.exit(0);
    }

    for (const contest of contests) {
      console.log(`\n🏆 Contest: ${contest.title} (ID: ${contest._id})`);
      console.log(`   Status: ${contest.status} (Virtual field, might need calculation)`);
      console.log(`   Start: ${contest.startTime}`);
      console.log(`   End: ${contest.endTime}`);
      console.log(`   Participants: ${contest.participants.length}`);
      
      if (contest.participants.length > 0) {
        console.log('   --- Leaderboard Data ---');
        contest.participants.forEach((p, i) => {
          console.log(`   ${i + 1}. User: ${p.userId?.username || 'Unknown'} (${p.userId?._id})`);
          console.log(`      Score: ${p.score}, Solved: ${p.solved}`);
          console.log(`      Submitted: ${p.isSubmitted}, Last Sub: ${p.lastSubmissionAt}`);
        });
      } else {
        console.log('   (No participants)');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

inspectContest();
