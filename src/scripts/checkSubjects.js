const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('../models/Problem');

const checkSubjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const problems = await Problem.find({}, 'title subject createdAt').sort({ createdAt: -1 }).limit(20);
    
    console.log("--- Latest 20 Problems ---");
    problems.forEach(p => {
        console.log(`Title: ${p.title.padEnd(30)} | Subject: ${p.subject || 'MISSING'} | Created: ${p.createdAt}`);
    });

    const chemCount = await Problem.countDocuments({ subject: 'Chemistry' });
    console.log(`\nTotal Chemistry Problems: ${chemCount}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkSubjects();
