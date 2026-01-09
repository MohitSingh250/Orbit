require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Problem = require('../models/Problem');

async function addDiverseProblems() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('🚀 Connected to database...');

    const problems = [];

    // --- PHYSICS (20) ---
    const physicsData = [
      { title: 'Projectile Motion on an Incline', topic: 'Mechanics', diff: 'hard' },
      { title: 'Conservation of Angular Momentum', topic: 'Rotational Motion', diff: 'medium' },
      { title: 'Efficiency of a Carnot Engine', topic: 'Thermodynamics', diff: 'medium' },
      { title: 'Electric Potential of a Charged Disk', topic: 'Electrostatics', diff: 'hard' },
      { title: 'Drift Velocity in a Conductor', topic: 'Current Electricity', diff: 'easy' },
      { title: 'Magnetic Field of a Solenoid', topic: 'Magnetism', diff: 'easy' },
      { title: 'Self-Inductance of a Coil', topic: 'EMI', diff: 'medium' },
      { title: 'Superposition of Sound Waves', topic: 'Waves & Oscillations', diff: 'medium' },
      { title: 'Total Internal Reflection in a Prism', topic: 'Optics', diff: 'easy' },
      { title: 'De Broglie Wavelength of an Electron', topic: 'Modern Physics', diff: 'easy' },
      { title: 'Bernoulli\'s Principle in Pipe Flow', topic: 'Fluid Mechanics', diff: 'medium' },
      { title: 'Relative Velocity in Two Dimensions', topic: 'Kinematics', diff: 'easy' },
      { title: 'Work Done by a Variable Force', topic: 'Mechanics', diff: 'easy' },
      { title: 'Moment of Inertia of a Hollow Sphere', topic: 'Rotational Motion', diff: 'hard' },
      { title: 'Specific Heat Capacity of a Gas', topic: 'Thermodynamics', diff: 'easy' },
      { title: 'Gauss\'s Law for a Spherical Shell', topic: 'Electrostatics', diff: 'medium' },
      { title: 'Kirchhoff\'s Loop Rule Application', topic: 'Current Electricity', diff: 'medium' },
      { title: 'Force on a Moving Charge in B-Field', topic: 'Magnetism', diff: 'easy' },
      { title: 'Lenz\'s Law and Induced Current', topic: 'EMI', diff: 'easy' },
      { title: 'Young\'s Double Slit Interference', topic: 'Optics', diff: 'hard' }
    ];

    physicsData.forEach((data, i) => {
      problems.push({
        title: data.title,
        statement: `A detailed ${data.diff} level problem exploring the principles of ${data.topic}. Scenario: Analyze the physical system and determine the correct parameter based on the given constraints.`,
        subject: 'Physics',
        topics: [data.topic],
        tags: ['conceptual', 'physics-logic', data.diff],
        difficulty: data.diff,
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Increases by a factor of 2' },
          { id: 'B', text: 'Decreases by half' },
          { id: 'C', text: 'Remains unchanged' },
          { id: 'D', text: 'Depends on the initial mass' }
        ],
        correctAnswer: 'A',
        points: data.diff === 'easy' ? 2 : data.diff === 'medium' ? 3 : 5,
        hints: [
          { level: 1, text: `Think about the relationship between variables in ${data.topic}.` },
          { level: 2, text: `Apply the conservation laws relevant to this ${data.diff} scenario.` }
        ],
        solution: `The analysis of ${data.topic} shows that the system follows the expected ${data.diff} behavior.`,
      });
    });

    // --- CHEMISTRY (20) ---
    const chemistryData = [
      { title: 'Nucleophilic Substitution Mechanisms', topic: 'Organic Chemistry', diff: 'hard' },
      { title: 'Crystal Field Splitting in Octahedral Complexes', topic: 'Inorganic Chemistry', diff: 'hard' },
      { title: 'Colligative Properties of Non-Ideal Solutions', topic: 'Physical Chemistry', diff: 'medium' },
      { title: 'Inductive and Mesomeric Effects', topic: 'GOC', diff: 'medium' },
      { title: 'Isomerism in Coordination Compounds', topic: 'Coordination Compounds', diff: 'medium' },
      { title: 'Hybridization and Molecular Geometry', topic: 'Chemical Bonding', diff: 'easy' },
      { title: 'Nernst Equation and Cell Potential', topic: 'Electrochemistry', diff: 'hard' },
      { title: 'Activation Energy and Arrhenius Equation', topic: 'Chemical Kinetics', diff: 'medium' },
      { title: 'Enthalpy and Entropy Changes', topic: 'Thermodynamics', diff: 'easy' },
      { title: 'Buffer Solutions and pH Calculation', topic: 'Equilibrium', diff: 'medium' },
      { title: 'Periodic Trends in Ionization Energy', topic: 'Periodic Table', diff: 'easy' },
      { title: 'Reactions of Carbonyl Compounds', topic: 'Aldehydes & Ketones', diff: 'hard' },
      { title: 'Stereochemistry of Alkanes', topic: 'Organic Chemistry', diff: 'medium' },
      { title: 'Extraction of Metals from Ores', topic: 'Inorganic Chemistry', diff: 'easy' },
      { title: 'Vapor Pressure and Raoult\'s Law', topic: 'Physical Chemistry', diff: 'easy' },
      { title: 'Resonance Structures of Benzene', topic: 'GOC', diff: 'easy' },
      { title: 'Ligand Field Theory Basics', topic: 'Coordination Compounds', diff: 'hard' },
      { title: 'VSEPR Theory Applications', topic: 'Chemical Bonding', diff: 'easy' },
      { title: 'Electrolysis of Molten Salts', topic: 'Electrochemistry', diff: 'medium' },
      { title: 'Rate Laws and Reaction Order', topic: 'Chemical Kinetics', diff: 'easy' }
    ];

    chemistryData.forEach((data, i) => {
      problems.push({
        title: data.title,
        statement: `A ${data.diff} level exploration of ${data.topic}. Question: Based on the chemical properties and reaction conditions, predict the major product or the behavior of the system.`,
        subject: 'Chemistry',
        topics: [data.topic],
        tags: ['chemical-theory', 'chemistry-logic', data.diff],
        difficulty: data.diff,
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: 'Formation of a stable intermediate' },
          { id: 'B', text: 'Rapid decomposition' },
          { id: 'C', text: 'No observable change' },
          { id: 'D', text: 'Precipitation of a salt' }
        ],
        correctAnswer: 'A',
        points: data.diff === 'easy' ? 2 : data.diff === 'medium' ? 3 : 5,
        hints: [
          { level: 1, text: `Consider the electronic effects in ${data.topic}.` },
          { level: 2, text: `Evaluate the stability of the species in this ${data.diff} context.` }
        ],
        solution: `The ${data.topic} principles indicate that the reaction proceeds via the most stable pathway.`,
      });
    });

    // --- MATHS (20) ---
    const mathsData = [
      { title: 'Limits of Indeterminate Forms', topic: 'Calculus', diff: 'medium' },
      { title: 'Definite Integrals as Area', topic: 'Integration', diff: 'easy' },
      { title: 'Implicit Differentiation Techniques', topic: 'Differentiation', diff: 'medium' },
      { title: 'Permutations and Combinations', topic: 'Algebra', diff: 'easy' },
      { title: 'Equation of a Tangent to a Circle', topic: 'Coordinate Geometry', diff: 'medium' },
      { title: 'Cross Product of Two Vectors', topic: 'Vectors & 3D', diff: 'easy' },
      { title: 'Conditional Probability Problems', topic: 'Probability', diff: 'hard' },
      { title: 'Inverse of a 3x3 Matrix', topic: 'Matrices & Determinants', diff: 'hard' },
      { title: 'Roots of Unity in Complex Plane', topic: 'Complex Numbers', diff: 'hard' },
      { title: 'Sum of Infinite Geometric Series', topic: 'Sequences & Series', diff: 'easy' },
      { title: 'Trigonometric Equations and General Solutions', topic: 'Trigonometry', diff: 'medium' },
      { title: 'Properties of a Parabola', topic: 'Conic Sections', diff: 'medium' },
      { title: 'Mean Value Theorem Application', topic: 'Calculus', diff: 'hard' },
      { title: 'Integration by Parts Method', topic: 'Integration', diff: 'medium' },
      { title: 'Successive Differentiation', topic: 'Differentiation', diff: 'hard' },
      { title: 'Binomial Theorem for Any Index', topic: 'Algebra', diff: 'hard' },
      { title: 'Distance Between Two Parallel Lines', topic: 'Coordinate Geometry', diff: 'easy' },
      { title: 'Scalar Triple Product', topic: 'Vectors & 3D', diff: 'medium' },
      { title: 'Bayes\' Theorem Application', topic: 'Probability', diff: 'hard' },
      { title: 'Cramer\'s Rule for Linear Systems', topic: 'Matrices & Determinants', diff: 'medium' }
    ];

    mathsData.forEach((data, i) => {
      problems.push({
        title: data.title,
        statement: `A ${data.diff} level mathematical challenge in ${data.topic}. Task: Solve the given equation or identify the property that holds true for the described mathematical object.`,
        subject: 'Maths',
        topics: [data.topic],
        tags: ['quantitative', 'math-logic', data.diff],
        difficulty: data.diff,
        inputType: 'mcq_single',
        options: [
          { id: 'A', text: '0' },
          { id: 'B', text: '1' },
          { id: 'C', text: 'e' },
          { id: 'D', text: 'π' }
        ],
        correctAnswer: 'B',
        points: data.diff === 'easy' ? 2 : data.diff === 'medium' ? 3 : 5,
        hints: [
          { level: 1, text: `Apply the standard ${data.topic} formulas.` },
          { level: 2, text: `Simplify the expression using ${data.diff} level techniques.` }
        ],
        solution: `The mathematical derivation for ${data.topic} leads to the correct ${data.diff} result.`,
      });
    });

    const inserted = await Problem.insertMany(problems);
    console.log(`✅ Successfully added ${inserted.length} diverse problems!`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding diverse problems:', err);
    process.exit(1);
  }
}

addDiverseProblems();
