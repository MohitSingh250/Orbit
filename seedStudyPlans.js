require('dotenv').config();
const mongoose = require('mongoose');
const StudyPlan = require('./src/models/StudyPlan');
const Problem = require('./src/models/Problem');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Clear existing study plans
    await StudyPlan.deleteMany({});
    console.log('Cleared existing study plans');

    // 2. Fetch existing problems to link
    // 2. Fetch existing problems
    const allProblems = await Problem.find();
    if (allProblems.length === 0) {
        console.log("No problems found. Run seedQuests.js first.");
        process.exit(1);
    }

    const physicsProblems = allProblems.filter(p => p.subject === 'Physics');
    const chemistryProblems = allProblems.filter(p => p.subject === 'Chemistry');
    const mathsProblems = allProblems.filter(p => p.subject === 'Maths');

    // Helper to get random problems from a specific list
    const getProblems = (sourceList, count) => {
        if (!sourceList || sourceList.length === 0) return [];
        const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(p => p._id);
    };

    // 3. Create Study Plans
    const planData = [
      // --- 30 DAYS CHALLENGE ---
      {
        title: "JEE Mains 2026 Sprint",
        description: "The ultimate 30-day crash course to secure 99%ile.",
        category: "Challenge",
        image: "/store/sprint_v2.png",
        isFeatured: true,
        summary: ["30 Days of intense practice", "Covers Physics, Chem, & Maths", "High-weightage topics only"],
        modules: [
            { title: "Day 1: Kinematics (Physics)", problemIds: getProblems(physicsProblems, 5) },
            { title: "Day 2: Mole Concept (Chem)", problemIds: getProblems(chemistryProblems, 5) },
            { title: "Day 3: Sets & Relations (Maths)", problemIds: getProblems(mathsProblems, 5) },
            { title: "Day 4: Newton's Laws (Physics)", problemIds: getProblems(physicsProblems, 5) },
            { title: "Day 5: Atomic Structure (Chem)", problemIds: getProblems(chemistryProblems, 5) },
        ]
      },
      {
        title: "30 Days of Organic",
        description: "Master Organic Chemistry in one month.",
        category: "Challenge",
        image: "/store/organic_v2.png",
        isFeatured: true,
        summary: ["Daily Reaction Mechanisms", "Name Reactions", "Conversions"],
        modules: [
            { title: "Day 1: IUPAC Nomenclature", problemIds: getProblems(chemistryProblems, 5) },
            { title: "Day 2: Isomerism", problemIds: getProblems(chemistryProblems, 5) },
            { title: "Day 3: GOC & Resonance", problemIds: getProblems(chemistryProblems, 5) },
            { title: "Day 4: Hydrocarbons", problemIds: getProblems(chemistryProblems, 5) },
        ]
      },

      // --- IN-DEPTH TOPICS ---
      {
        title: "Mechanics Mastery",
        description: "Deep dive into Physics Mechanics.",
        category: "Deep Dive",
        image: "/store/physics_v2.png",
        isFeatured: true,
        summary: ["From Kinematics to Rotation", "Builds strong base", "Advanced Problems"],
        modules: [
            { title: "Kinematics 1D & 2D", problemIds: getProblems(physicsProblems, 8) },
            { title: "Laws of Motion", problemIds: getProblems(physicsProblems, 8) },
            { title: "Work Power Energy", problemIds: getProblems(physicsProblems, 8) },
            { title: "Rotational Motion", problemIds: getProblems(physicsProblems, 10) },
        ]
      },
      {
        title: "Calculus Cracked",
        description: "Complete Calculus for JEE Advanced.",
        category: "Deep Dive",
        image: "/store/maths_v2.png",
        isFeatured: true,
        summary: ["Limits to Differential Eq", "Graph Transformations", "Area under Curve"],
        modules: [
            { title: "Limits & Continuity", problemIds: getProblems(mathsProblems, 8) },
            { title: "Derivatives", problemIds: getProblems(mathsProblems, 10) },
            { title: "Integration", problemIds: getProblems(mathsProblems, 10) },
        ]
      },
      {
        title: "Electrodynamics",
        description: "Master Charges, Fields, and Circuits.",
        category: "Deep Dive",
        image: "/store/physics_v2.png",
        isFeatured: false,
        summary: ["Electrostatics", "Current Electricity", "Magnetism"],
        modules: [
            { title: "Electrostatics", problemIds: getProblems(physicsProblems, 8) },
            { title: "Capacitors", problemIds: getProblems(physicsProblems, 8) },
            { title: "Current Electricity", problemIds: getProblems(physicsProblems, 8) },
        ]
      },

      // --- INTRODUCTION TO ---
      {
        title: "Introduction to Vectors",
        description: "The language of Physics.",
        category: "Intro",
        image: "/store/physics_v2.png",
        isFeatured: false,
        summary: ["Dot & Cross Product", "Resolution of Vectors", "Basic Applications"],
        modules: [
            { title: "Vector Basics", problemIds: getProblems(physicsProblems, 5) },
            { title: "Vector Algebra", problemIds: getProblems(physicsProblems, 5) },
        ]
      },
      {
        title: "Intro to Mole Concept",
        description: "Foundation of Physical Chemistry.",
        category: "Intro",
        image: "/store/organic_v2.png",
        isFeatured: false,
        summary: ["Moles & Mass", "Stoichiometry", "Concentration Terms"],
        modules: [
            { title: "Mole Basics", problemIds: getProblems(chemistryProblems, 5) },
            { title: "Stoichiometry", problemIds: getProblems(chemistryProblems, 5) },
        ]
      },
      {
        title: "Intro to Trigonometry",
        description: "Essential Maths for JEE.",
        category: "Intro",
        image: "/store/maths_v2.png",
        isFeatured: false,
        summary: ["Identities", "Equations", "Graphs"],
        modules: [
            { title: "Basic Identities", problemIds: getProblems(mathsProblems, 5) },
            { title: "Trig Equations", problemIds: getProblems(mathsProblems, 5) },
        ]
      }
    ];

    // Insert plans
    const insertedPlans = await StudyPlan.insertMany(planData);
    
    // Add relations
    if (insertedPlans.length > 4) {
        await StudyPlan.findByIdAndUpdate(insertedPlans[0]._id, { relatedPlans: [insertedPlans[2]._id, insertedPlans[3]._id] });
        await StudyPlan.findByIdAndUpdate(insertedPlans[2]._id, { relatedPlans: [insertedPlans[0]._id, insertedPlans[4]._id] });
    }

    console.log('Inserted categorized study plans');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
