const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api';
const JWT_SECRET = process.env.JWT_SECRET;

async function verify() {
  try {
    console.log('--- Starting Discussion API Verification ---');

    // 1. Connect to DB to get IDs
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./src/models/User');
    const Problem = require('./src/models/Problem');

    const user = await User.findOne({ username: 'admin' });
    const problem = await Problem.findOne();

    if (!user || !problem) {
      console.error('User or Problem not found in DB');
      process.exit(1);
    }

    // 2. Generate Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    console.log(`Using User: ${user.username} (${user._id})`);
    console.log(`Using Problem: ${problem.title} (${problem._id})`);

    // 3. Create Discussion
    console.log('\n1. Creating Discussion...');
    const discRes = await axios.post(`${API_URL}/discussions`, {
      title: 'Test Discussion for ' + problem.title,
      content: 'This is a test discussion content with **markdown** support.',
      problemId: problem._id,
      tags: ['test', 'verification']
    }, authHeader);
    const discussion = discRes.data;
    console.log('Discussion Created:', discussion._id);

    // 4. Get Discussions by Problem
    console.log('\n2. Fetching Discussions for Problem...');
    const listRes = await axios.get(`${API_URL}/discussions/problem/${problem._id}`);
    console.log(`Found ${listRes.data.length} discussions`);

    // 5. Toggle Upvote
    console.log('\n3. Toggling Upvote...');
    const upvoteRes = await axios.post(`${API_URL}/discussions/${discussion._id}/upvote`, {}, authHeader);
    console.log('Upvote Result:', upvoteRes.data);

    // 6. Add Comment
    console.log('\n4. Adding Comment...');
    const commentRes = await axios.post(`${API_URL}/discussions/comments`, {
      content: 'This is a test comment.',
      discussionId: discussion._id
    }, authHeader);
    const comment = commentRes.data;
    console.log('Comment Added:', comment._id);

    // 7. Get Comments
    console.log('\n5. Fetching Comments for Discussion...');
    const commentsRes = await axios.get(`${API_URL}/discussions/${discussion._id}/comments`);
    console.log(`Found ${commentsRes.data.length} comments`);

    console.log('\n--- Verification Successful ---');
    process.exit(0);
  } catch (err) {
    console.error('\n--- Verification Failed ---');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

verify();
