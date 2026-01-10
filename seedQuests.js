require('dotenv').config();
const mongoose = require('mongoose');
const Quest = require('./src/models/Quest');

const quests = [
  {
    title: "Physics Mastery",
    description: "Master the laws of the universe for JEE.",
    category: "physics",
    totalLevels: 35,
    sections: [
      {
        id: "mechanics",
        title: "Mechanics Shoal",
        nodes: [
          { id: 1, title: "Kinematics I", type: "node" },
          { id: 2, title: "Newton's Laws", type: "node" },
          { id: 3, title: "Work & Energy", type: "node" },
          { id: 4, type: "chest" },
          { id: 5, title: "Rotational Motion", type: "node" },
          { id: 6, type: "mystery" },
        ]
      },
      {
        id: "thermodynamics",
        title: "Thermal Valley",
        nodes: [
          { id: 7, title: "Heat Transfer", type: "node" },
          { id: 8, title: "Thermodynamics", type: "node" },
        ]
      }
    ]
  },
  {
    title: "Chemistry Core",
    description: "From atoms to reactions, master it all.",
    category: "chemistry",
    totalLevels: 28,
    sections: [
      {
        id: "organic",
        title: "Carbon Kingdom",
        nodes: [
          { id: 1, title: "Nomenclature", type: "node" },
          { id: 2, title: "Isomerism", type: "node" },
          { id: 3, type: "chest" },
        ]
      }
    ]
  },
  {
    title: "Mathematics Excellence",
    description: "Calculus, Algebra, and more.",
    category: "maths",
    totalLevels: 7,
    sections: [
      {
        id: "calculus",
        title: "Limitless Valley",
        nodes: [
          { id: 1, title: "Limits", type: "node" },
          { id: 2, title: "Derivatives", type: "node" },
          { id: 3, type: "chest" },
        ]
      }
    ]
  },
  {
    title: "Database",
    description: "Master SQL and NoSQL.",
    category: "database",
    totalLevels: 5,
    sections: [
      {
        id: "sql",
        title: "Query Kingdom",
        nodes: [
          { id: 1, title: "Select", type: "node" },
        ]
      }
    ]
  },
  {
    title: "System & Software Design",
    description: "Scalability and Architecture.",
    category: "design",
    totalLevels: 5,
    sections: [
      {
        id: "design",
        title: "Architecture Arch",
        nodes: [
          { id: 1, title: "Load Balancing", type: "node" },
        ]
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    await Quest.deleteMany({});
    console.log('Cleared existing quests');
    
    await Quest.insertMany(quests);
    console.log('Inserted seed quests');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
