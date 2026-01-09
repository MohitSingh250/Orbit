require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Problem = require('../models/Problem');

async function addBulkProblems() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('🚀 Connected to database...');

    const problems = [];

    // --- PHYSICS (30) ---
    const physicsTopics = ['Mechanics', 'Thermodynamics', 'Optics', 'Electrostatics', 'Magnetism', 'Modern Physics', 'Waves'];
    const diffs = ['easy', 'medium', 'hard'];

    for (let i = 1; i <= 30; i++) {
      const diff = diffs[(i - 1) % 3];
      const topic = physicsTopics[(i - 1) % physicsTopics.length];
      problems.push({
        title: `Physics ${topic} Challenge ${i}`,
        statement: `A ${diff} level conceptual question about ${topic}. Scenario: A physical system is observed under specific conditions. What is the expected outcome based on ${topic} principles?`,
        subject: 'Physics',
        topics: [topic],
        tags: ['conceptual', 'logic', diff],
        difficulty: diff,
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Increases linearly' },
          { id: 'B', text: 'Decreases exponentially' },
          { id: 'C', text: 'Remains constant' },
          { id: 'D', text: 'Becomes zero' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        points: diff === 'easy' ? 2 : diff === 'medium' ? 3 : 5,
        hints: [
          { level: 1, text: `Consider the fundamental laws of ${topic}.` },
          { level: 2, text: `Think about how the variables relate in a ${diff} scenario.` }
        ],
        solution: `Based on the principles of ${topic}, the system behaves according to the established mathematical models for ${diff} problems.`,
      });
    }

    // --- CHEMISTRY (30) ---
    const chemistryTopics = ['Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Kinetics', 'Organic Chemistry', 'Inorganic Chemistry'];
    for (let i = 1; i <= 30; i++) {
      const diff = diffs[(i - 1) % 3];
      const topic = chemistryTopics[(i - 1) % chemistryTopics.length];
      problems.push({
        title: `Chemistry ${topic} Exploration ${i}`,
        statement: `A ${diff} level problem in ${topic}. Question: Given a chemical reaction or molecular structure, identify the key property or behavior under standard conditions.`,
        subject: 'Chemistry',
        topics: [topic],
        tags: ['chemical', 'theory', diff],
        difficulty: diff,
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Exothermic and spontaneous' },
          { id: 'B', text: 'Endothermic and non-spontaneous' },
          { id: 'C', text: 'Equilibrium shifts right' },
          { id: 'D', text: 'No reaction occurs' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        points: diff === 'easy' ? 2 : diff === 'medium' ? 3 : 5,
        hints: [
          { level: 1, text: `Recall the ${topic} trends in the periodic table or reaction series.` },
          { level: 2, text: `Apply the ${diff} level concepts of energy and entropy.` }
        ],
        solution: `The ${topic} analysis reveals that the molecular interactions lead to the observed ${diff} behavior.`,
      });
    }

    // --- MATHS (30) ---
    const mathsTopics = ['Calculus', 'Algebra', 'Trigonometry', 'Coordinate Geometry', 'Probability', 'Vectors', 'Statistics'];
    for (let i = 1; i <= 30; i++) {
      const diff = diffs[(i - 1) % 3];
      const topic = mathsTopics[(i - 1) % mathsTopics.length];
      problems.push({
        title: `Maths ${topic} Problem ${i}`,
        statement: `A ${diff} level mathematical challenge in ${topic}. Solve for the unknown variable or identify the correct property of the given function/set.`,
        subject: 'Maths',
        topics: [topic],
        tags: ['quantitative', 'logic', diff],
        difficulty: diff,
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'x = 0' },
          { id: 'B', text: 'Converges to 1' },
          { id: 'C', text: 'Undefined' },
          { id: 'D', text: 'Infinity' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        points: diff === 'easy' ? 2 : diff === 'medium' ? 3 : 5,
        hints: [
          { level: 1, text: `Start by simplifying the ${topic} expression.` },
          { level: 2, text: `Use the ${diff} level theorems associated with ${topic}.` }
        ],
        solution: `By applying the ${topic} formulas and logical steps, we arrive at the ${diff} solution.`,
      });
    }

    const inserted = await Problem.insertMany(problems);
    console.log(`✅ Successfully added ${inserted.length} bulk problems!`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding bulk problems:', err);
    process.exit(1);
  }
}

addBulkProblems();
