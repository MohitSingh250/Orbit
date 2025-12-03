const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const Problem = require('../models/Problem');

const verify = async () => {
  try {
    // 1. Check DB
    await mongoose.connect(process.env.MONGO_URI);
    const dbCount = await Problem.countDocuments({ subject: 'Chemistry' });
    console.log(`DB: Found ${dbCount} Chemistry problems.`);

    // 2. Check API
    const url = 'http://localhost:4000/api/problems';
    const params = { subject: 'Chemistry' };
    console.log(`API: Fetching from ${url} with params:`, params);
    
    try {
        const res = await axios.get(url, { params });
        const apiProblems = res.data.problems || res.data; // Handle both formats
        const apiCount = Array.isArray(apiProblems) ? apiProblems.length : 0;
        
        console.log(`API: Returned ${apiCount} problems.`);
        
        if (apiCount === dbCount) {
            console.log("✅ SUCCESS: API matches DB count.");
        } else {
            console.log("❌ FAILURE: API count does NOT match DB count!");
            if (apiCount > dbCount) {
                console.log("   (API is returning extra problems, likely ignoring filter)");
            }
        }
        
        if (apiCount > 0) {
            console.log("API First Problem Subject:", apiProblems[0].subject);
        }

    } catch (apiErr) {
        console.error("API Error:", apiErr.message);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verify();
