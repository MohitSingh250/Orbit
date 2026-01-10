const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Discussion = require('./src/models/Discussion');
const Comment = require('./src/models/Comment');
const Problem = require('./src/models/Problem');

const SEED_USERS = [
  { username: 'Aryan_JEE', email: 'aryan@example.com', avatar: 'https://i.pravatar.cc/150?u=aryan' },
  { username: 'Priya_Sharma', email: 'priya@example.com', avatar: 'https://i.pravatar.cc/150?u=priya' },
  { username: 'IIT_Dreamer', email: 'dreamer@example.com', avatar: 'https://i.pravatar.cc/150?u=dreamer' },
  { username: 'Physics_Wizard', email: 'wizard@example.com', avatar: 'https://i.pravatar.cc/150?u=wizard' },
  { username: 'Chemistry_Queen', email: 'queen@example.com', avatar: 'https://i.pravatar.cc/150?u=queen' }
];

const DISCUSSIONS = [
  {
    title: "How to master Rotational Mechanics for JEE Advanced?",
    content: "I've been struggling with moment of inertia and rolling motion. Any tips on how to approach these problems? Which book is better: Irodov or HC Verma?",
    category: "Physics",
    tags: ["Mechanics", "JEE Advanced", "Physics"],
    authorIdx: 0
  },
  {
    title: "Best resources for Organic Chemistry mechanisms?",
    content: "Organic chemistry seems like a lot of memorization. How do you guys understand the mechanisms? Is Peter Sykes too advanced for JEE?",
    category: "Chemistry",
    tags: ["Organic", "Chemistry", "Resources"],
    authorIdx: 1
  },
  {
    title: "My strategy for 99.9 percentile in JEE Main",
    content: "I managed to get 99.9 percentile in the last attempt. Here is my daily schedule and the books I used. Hope this helps!",
    category: "General",
    tags: ["Strategy", "Success Story", "JEE Main"],
    authorIdx: 2
  },
  {
    title: "Doubt in Ionic Equilibrium - Buffer solutions",
    content: "Can someone explain why the pH of a buffer solution doesn't change much on adding a small amount of acid or base? I'm confused about the Henderson-Hasselbalch equation.",
    category: "Chemistry",
    tags: ["Physical Chemistry", "Equilibrium"],
    authorIdx: 3
  },
  {
    title: "Is NCERT enough for JEE Main Physics?",
    content: "Everyone says NCERT is enough for Chemistry, but what about Physics? Should I solve HC Verma as well for Main level?",
    category: "Physics",
    tags: ["Physics", "NCERT", "JEE Main"],
    authorIdx: 4
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Clear existing data
    await Discussion.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing discussions and comments');

    // 2. Create/Get Users
    const users = [];
    const passwordHash = await bcrypt.hash('password123', 10);
    
    for (const u of SEED_USERS) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User({
          ...u,
          passwordHash,
          roles: ['user']
        });
        await user.save();
        console.log(`Created user: ${u.username}`);
      }
      users.push(user);
    }

    const problem = await Problem.findOne();

    // 3. Create Discussions
    for (const d of DISCUSSIONS) {
      const discussion = new Discussion({
        title: d.title,
        content: d.content,
        category: d.category,
        tags: d.tags,
        author: users[d.authorIdx]._id,
        problemId: problem ? problem._id : null,
        views: Math.floor(Math.random() * 500) + 100,
        upvotes: users.slice(0, Math.floor(Math.random() * 5)).map(u => u._id)
      });
      await discussion.save();
      console.log(`Created discussion: ${d.title}`);

      // 4. Add some comments
      const comment1 = new Comment({
        content: "Great question! I think HC Verma is essential for concepts, and Irodov for practice.",
        author: users[(d.authorIdx + 1) % 5]._id,
        discussionId: discussion._id,
        upvotes: users.slice(0, 2).map(u => u._id)
      });
      await comment1.save();

      const comment2 = new Comment({
        content: "I agree. Focus on the basics first.",
        author: users[(d.authorIdx + 2) % 5]._id,
        discussionId: discussion._id,
        parentId: comment1._id
      });
      await comment2.save();

      const comment3 = new Comment({
        content: "Thanks for the tips!",
        author: users[d.authorIdx]._id,
        discussionId: discussion._id,
        parentId: comment1._id
      });
      await comment3.save();

      await Discussion.findByIdAndUpdate(discussion._id, { $set: { commentCount: 3 } });
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
