require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

async function seed() {
  await connectDB(process.env.MONGO_URI);
  console.log('🚀 Starting database seeding...');

  // --- Clear old data ---
  await User.deleteMany({});
  await Problem.deleteMany({});
  await Submission.deleteMany({});
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
      bookmarks: [],
    });
    users.push(user);
  }
  console.log('👥 10 users created');

  // -------------------------- PROBLEMS --------------------------
  console.log('📘 Creating 50 conceptual, logical problems...');

  const baseProblems = [
    {
      title: 'Friction Logic – Angle of Repose',
      statement:
        'A wooden block rests on a rough inclined plane. The angle of repose is 30°. If the plane is inclined at 25°, what happens when a small horizontal push is given?',
      topics: ['Mechanics', 'Friction'],
      tags: ['conceptual', 'logical'],
      difficulty: 'easy',
      inputType: 'mcq_single',
      options: [
        { id: 'A', text: 'Block moves up the plane' },
        { id: 'B', text: 'Block moves down the plane' },
        { id: 'C', text: 'Block remains at rest' },
        { id: 'D', text: 'Block oscillates' },
      ],
      correctAnswer: 'C',
      hints: [
        { level: 1, text: 'Compare applied force with limiting friction.' },
        { level: 2, text: 'tanθ < μ ⇒ remains at rest unless F > F_limiting.' },
      ],
      solution:
        'At 25°, component of gravity < limiting friction ⇒ block stays at rest unless push exceeds friction limit.',
      points: 2,
    },
    {
      title: 'Electrostatics Logic – Field Between Equal Charges',
      statement:
        'Two equal positive charges +Q are fixed at x = +a and x = −a. Find where the net electric field on the x-axis is zero.',
      topics: ['Electrostatics'],
      tags: ['conceptual'],
      difficulty: 'easy',
      inputType: 'mcq_single',
      options: [
        { id: 'A', text: 'At x = 0' },
        { id: 'B', text: 'At x = ±a/2' },
        { id: 'C', text: 'At x > a or x < −a' },
        { id: 'D', text: 'No such point' },
      ],
      correctAnswer: 'C',
      hints: [
        { level: 1, text: 'Check direction of electric field between and outside charges.' },
        { level: 2, text: 'Between them fields add, outside they oppose.' },
      ],
      solution: 'Field cancels only outside the region between the charges.',
      points: 1,
    },
    {
      title: 'Thermal Expansion Logic',
      statement:
        'A brass ring just fits over a steel rod at 20°C. On heating the system uniformly, what happens?',
      topics: ['Thermodynamics'],
      tags: ['logic'],
      difficulty: 'easy',
      inputType: 'mcq_single',
      options: [
        { id: 'A', text: 'Ring tightens' },
        { id: 'B', text: 'Ring loosens' },
        { id: 'C', text: 'No change' },
        { id: 'D', text: 'Depends on time' },
      ],
      correctAnswer: 'B',
      hints: [
        { level: 1, text: 'Compare αbrass and αsteel.' },
        { level: 2, text: 'Higher expansion coefficient ⇒ expands more.' },
      ],
      solution: 'Brass expands more ⇒ ring loosens.',
      points: 1,
    },
    {
      title: 'Work-Energy Logic – Spring Compression',
      statement:
        'A spring (k = 100 N/m) is compressed by 10 cm. The energy stored is how many joules?',
      topics: ['Mechanics', 'Work-Energy'],
      tags: ['numeric'],
      difficulty: 'easy',
      inputType: 'numeric',
      correctAnswer: 0.5,
      numericTolerance: 0.01,
      hints: [
        { level: 1, text: 'Use U = ½kx².' },
        { level: 2, text: 'Convert cm to meters.' },
      ],
      solution: 'U = ½×100×(0.1)² = 0.5 J.',
      points: 2,
    },
    {
      title: 'Optics Logic – Image Shift in Mirror',
      statement:
        'A plane mirror is moved by 2 cm toward a stationary object. The image shifts by how much (in cm)?',
      topics: ['Optics'],
      tags: ['logical'],
      difficulty: 'easy',
      inputType: 'numeric',
      correctAnswer: 4,
      numericTolerance: 0.01,
      hints: [
        { level: 1, text: 'Image shift = 2 × mirror movement.' },
      ],
      solution: 'The image moves twice the mirror distance = 4 cm.',
      points: 1,
    },
    {
      title: 'Modern Physics Logic – Photon Energy',
      statement:
        'What is the energy (in eV) of a photon of wavelength 400 nm? (hc = 1240 eV·nm)',
      topics: ['Modern Physics', 'Photon'],
      tags: ['numeric', 'logical'],
      difficulty: 'medium',
      inputType: 'numeric',
      correctAnswer: 3.1,
      numericTolerance: 0.1,
      hints: [
        { level: 1, text: 'E = hc/λ.' },
      ],
      solution: 'E = 1240/400 = 3.1 eV.',
      points: 2,
    },
  ];

  // --- Generate 44 additional logical problems ---
  const topicPool = [
    'Mechanics',
    'Electrostatics',
    'Current Electricity',
    'Magnetism',
    'Waves',
    'Optics',
    'Thermodynamics',
    'Modern Physics',
  ];
  const diffPool = ['easy', 'medium', 'hard'];
  const typePool = ['mcq_single', 'numeric', 'manual'];

  while (baseProblems.length < 50) {
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)];
    const diff = diffPool[Math.floor(Math.random() * diffPool.length)];
    const type = typePool[Math.floor(Math.random() * typePool.length)];

    const p = {
      title: `${topic} Logical Problem ${baseProblems.length + 1}`,
      statement: `A conceptual question from ${topic} that requires reasoning at a ${diff} level.`,
      topics: [topic],
      tags: ['logical', 'conceptual'],
      difficulty: diff,
      badges: ['advanced-logic'],
      sources: ['Physics-inspired seed'],
      points: Math.floor(Math.random() * 3) + 1,
      createdAt: new Date(),
      hints: [
        { level: 1, text: 'Think qualitatively first.' },
        { level: 2, text: 'Apply key principles of the topic.' },
      ],
      solution: 'Logical reasoning gives the correct conclusion.',
    };

    if (type === 'mcq_single') {
      Object.assign(p, {
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' },
        ],
        correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      });
    } else if (type === 'numeric') {
      Object.assign(p, {
        inputType: 'numeric',
        correctAnswer: (Math.random() * 10).toFixed(2),
        numericTolerance: 0.1,
      });
    } else {
      Object.assign(p, {
        inputType: 'manual',
        correctAnswer: 'Explain reasoning step by step.',
      });
    }

    baseProblems.push(p);
  }

  const problems = await Problem.insertMany(baseProblems);
  console.log(`✅ Inserted ${problems.length} logical problems`);

  // --- Create submissions for users ---
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
        createdAt: new Date(),
      });

      if (isCorrect) {
        user.solvedProblems.push({
          problemId: problem._id,
          solvedAt: new Date(),
        });
      }
    }

    await user.save();
  }

  console.log('✅ Added submissions and solved data');
  console.log('🎯 Seeding complete! 🚀');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
