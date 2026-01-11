require('dotenv').config();
const mongoose = require('mongoose');
const Quest = require('./src/models/Quest');
const Problem = require('./src/models/Problem');

// --- Helper Functions for Procedural Generation ---

const generateMathProblem = (topic, difficulty) => {
  const isMCQ = Math.random() > 0.5; // 50% chance of MCQ
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const c = Math.floor(Math.random() * 10) + 1;

  if (topic === 'Limits') {
    const ans = a * c + b;
    if (isMCQ) {
      return {
        title: `Limit of (${a}x + ${b})`,
        statement: `Evaluate the limit as x approaches ${c}: lim(x->${c}) (${a}x + ${b})`,
        subject: 'Maths',
        topics: ['Limits'],
        difficulty,
        inputType: 'mcq_single',
        options: [
            { id: 'a', text: `${ans}` },
            { id: 'b', text: `${ans + 2}` },
            { id: 'c', text: `${ans - 2}` },
            { id: 'd', text: `${ans * 2}` }
        ],
        correctAnswer: 'a',
        usage: 'quest'
      };
    }
    return {
      title: `Limit of (${a}x + ${b})`,
      statement: `Evaluate the limit as x approaches ${c}: lim(x->${c}) (${a}x + ${b})`,
      subject: 'Maths',
      topics: ['Limits'],
      difficulty,
      inputType: 'numeric',
      correctAnswer: ans,
      usage: 'quest'
    };
  } else if (topic === 'Derivatives') {
    const ans = 2 * a * c + b;
    if (isMCQ) {
       return {
        title: `Derivative of ${a}x^2 + ${b}x`,
        statement: `Find the derivative of f(x) = ${a}x^2 + ${b}x at x = ${c}.`,
        subject: 'Maths',
        topics: ['Derivatives'],
        difficulty,
        inputType: 'mcq_single',
        options: [
            { id: 'a', text: `${ans}` },
            { id: 'b', text: `${ans + 5}` },
            { id: 'c', text: `${ans - 5}` },
            { id: 'd', text: `${ans * 0}` }
        ],
        correctAnswer: 'a',
        usage: 'quest'
      };
    }
    return {
      title: `Derivative of ${a}x^2 + ${b}x`,
      statement: `Find the derivative of f(x) = ${a}x^2 + ${b}x at x = ${c}.`,
      subject: 'Maths',
      topics: ['Derivatives'],
      difficulty,
      inputType: 'numeric',
      correctAnswer: ans,
      usage: 'quest'
    };
  }
  return null;
};

const generatePhysicsProblem = (topic, difficulty) => {
  const isMCQ = Math.random() > 0.5;
  const u = Math.floor(Math.random() * 20); // initial velocity
  const a = Math.floor(Math.random() * 10) + 1; // acceleration
  const t = Math.floor(Math.random() * 10) + 1; // time
  const m = Math.floor(Math.random() * 10) + 1; // mass
  const f = m * a;

  if (topic === 'Kinematics') {
    const ans = u + a * t;
    if (isMCQ) {
        return {
            title: `Velocity after ${t}s`,
            statement: `A particle starts with initial velocity ${u} m/s and accelerates at ${a} m/s^2. What is its velocity after ${t} seconds?`,
            subject: 'Physics',
            topics: ['Kinematics'],
            difficulty,
            inputType: 'mcq_single',
            options: [
                { id: 'a', text: `${ans} m/s` },
                { id: 'b', text: `${ans + 10} m/s` },
                { id: 'c', text: `${ans - 5} m/s` },
                { id: 'd', text: `${ans * 2} m/s` }
            ],
            correctAnswer: 'a',
            usage: 'quest'
        };
    }
    return {
      title: `Velocity after ${t}s`,
      statement: `A particle starts with initial velocity ${u} m/s and accelerates at ${a} m/s^2. What is its velocity after ${t} seconds?`,
      subject: 'Physics',
      topics: ['Kinematics'],
      difficulty,
      inputType: 'numeric',
      correctAnswer: ans,
      usage: 'quest'
    };
  } else if (topic === 'Laws of Motion') {
    const ans = f;
    if (isMCQ) {
        return {
            title: `Force on ${m}kg block`,
            statement: `A block of mass ${m} kg accelerates at ${a} m/s^2. What is the net force acting on it?`,
            subject: 'Physics',
            topics: ['Laws of Motion'],
            difficulty,
            inputType: 'mcq_single',
            options: [
                { id: 'a', text: `${ans} N` },
                { id: 'b', text: `${ans + 50} N` },
                { id: 'c', text: `${ans / 2} N` },
                { id: 'd', text: `0 N` }
            ],
            correctAnswer: 'a',
            usage: 'quest'
        };
    }
    return {
      title: `Force on ${m}kg block`,
      statement: `A block of mass ${m} kg accelerates at ${a} m/s^2. What is the net force acting on it?`,
      subject: 'Physics',
      topics: ['Laws of Motion'],
      difficulty,
      inputType: 'numeric',
      correctAnswer: ans,
      usage: 'quest'
    };
  }
  return null;
};

const generateChemistryProblem = (topic, difficulty) => {
  if (topic === 'Nomenclature') {
    const alkanes = ['Methane', 'Ethane', 'Propane', 'Butane', 'Pentane', 'Hexane', 'Heptane', 'Octane'];
    const index = Math.floor(Math.random() * alkanes.length);
    const name = alkanes[index];
    const carbons = index + 1;
    
    return {
      title: `IUPAC: ${name}`,
      statement: `How many carbon atoms are in a molecule of ${name}?`,
      subject: 'Chemistry',
      topics: ['Organic Chemistry', 'Nomenclature'],
      difficulty,
      inputType: 'numeric',
      correctAnswer: carbons,
      usage: 'quest'
    };
  } else if (topic === 'Isomerism') {
    // Simple isomer questions
    const isomers = [
      { f: "C4H10", a: 2 },
      { f: "C5H12", a: 3 },
      { f: "C6H14", a: 5 },
      { f: "C3H8", a: 1 }, // No isomers really, just 1 structure
      { f: "C4H8 (alkene)", a: 3 } // Simplified
    ];
    const item = isomers[Math.floor(Math.random() * isomers.length)];
    return {
      title: `Isomers of ${item.f}`,
      statement: `How many structural isomers exist for the formula ${item.f}?`,
      subject: 'Chemistry',
      topics: ['Organic Chemistry', 'Isomerism'],
      difficulty,
      inputType: 'numeric',
      correctAnswer: item.a,
      usage: 'quest'
    };
  }
  return null;
};


// --- Main Seeding Logic ---

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Clear existing quest data
    await Quest.deleteMany({});
    await Problem.deleteMany({ usage: 'quest' });
    console.log('Cleared existing quest data');

    // 2. Generate Problems
    const problems = [];
    
    // Generate 100 Physics Problems (More for variable counts)
    for (let i = 0; i < 50; i++) problems.push(generatePhysicsProblem('Kinematics', 'easy'));
    for (let i = 0; i < 50; i++) problems.push(generatePhysicsProblem('Laws of Motion', 'medium'));

    // Generate 100 Maths Problems
    for (let i = 0; i < 50; i++) problems.push(generateMathProblem('Limits', 'easy'));
    for (let i = 0; i < 50; i++) problems.push(generateMathProblem('Derivatives', 'medium'));

    // Generate 60 Chemistry Problems
    for (let i = 0; i < 30; i++) problems.push(generateChemistryProblem('Nomenclature', 'easy'));
    for (let i = 0; i < 30; i++) problems.push(generateChemistryProblem('Isomerism', 'medium'));

    // Insert Problems
    const insertedProblems = await Problem.insertMany(problems);
    console.log(`Inserted ${insertedProblems.length} generated problems`);

    // Helper to get chunks of problem IDs with variable size
    let pIdx = 0;
    const getNextProblems = () => {
      const count = Math.floor(Math.random() * 5) + 5; // Random between 5 and 9
      const chunk = insertedProblems.slice(pIdx, pIdx + count).map(p => p._id);
      pIdx += count;
      return chunk;
    };

    // 3. Create Quests
    const quests = [
      {
        title: "Physics Mastery",
        description: "Master the laws of the universe.",
        category: "physics",
        totalLevels: 50,
        sections: [
          {
            id: "kinematics",
            title: "Kinematics Valley",
            nodes: [
              { id: 1, title: "Basics of Motion", type: "node", problemIds: getNextProblems() },
              { id: 2, title: "Velocity & Speed", type: "node", problemIds: getNextProblems() },
              { id: 3, type: "chest" },
              { id: 4, title: "Acceleration", type: "node", problemIds: getNextProblems() },
              { id: 5, title: "Equations of Motion", type: "node", problemIds: getNextProblems() },
              { id: 6, type: "mystery" },
              { id: 7, title: "Advanced Kinematics", type: "node", problemIds: getNextProblems() },
            ]
          },
          {
            id: "dynamics",
            title: "Dynamics Peak",
            nodes: [
              { id: 8, title: "Newton's First Law", type: "node", problemIds: getNextProblems() },
              { id: 9, title: "Force & Mass", type: "node", problemIds: getNextProblems() },
              { id: 10, type: "chest" },
              { id: 11, title: "Action & Reaction", type: "node", problemIds: getNextProblems() },
              { id: 12, title: "Friction", type: "node", problemIds: getNextProblems() },
            ]
          }
        ]
      },
      {
        title: "Mathematics Excellence",
        description: "The language of the universe.",
        category: "maths",
        totalLevels: 40,
        sections: [
          {
            id: "calculus_1",
            title: "Limits Forest",
            nodes: [
              { id: 1, title: "Intro to Limits", type: "node", problemIds: getNextProblems() },
              { id: 2, title: "Limit Laws", type: "node", problemIds: getNextProblems() },
              { id: 3, type: "chest" },
              { id: 4, title: "Continuity", type: "node", problemIds: getNextProblems() },
              { id: 5, title: "Limits at Infinity", type: "node", problemIds: getNextProblems() },
            ]
          },
          {
            id: "calculus_2",
            title: "Derivative Mountain",
            nodes: [
              { id: 6, title: "Slope of Tangent", type: "node", problemIds: getNextProblems() },
              { id: 7, title: "Power Rule", type: "node", problemIds: getNextProblems() },
              { id: 8, type: "mystery" },
              { id: 9, title: "Product Rule", type: "node", problemIds: getNextProblems() },
            ]
          }
        ]
      },
      {
        title: "Chemistry Core",
        description: "From atoms to reactions.",
        category: "chemistry",
        totalLevels: 28,
        sections: [
          {
            id: "organic",
            title: "Carbon Kingdom",
            nodes: [
              { id: 1, title: "Nomenclature", type: "node", problemIds: getNextProblems() },
              { id: 2, title: "Isomerism", type: "node", problemIds: getNextProblems() },
              { id: 3, type: "chest" },
              { id: 4, title: "Alkanes", type: "node", problemIds: getNextProblems() },
            ]
          }
        ]
      },
    ];

    await Quest.insertMany(quests);
    console.log('Inserted expanded quests');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
