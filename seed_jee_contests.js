const mongoose = require('mongoose');
const Contest = require('./src/models/Contest');
const dotenv = require('dotenv');

dotenv.config();

const seedContests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const now = new Date();
    
    // JEE Mains - Weekly, upcoming (e.g., next Sunday)
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(10, 0, 0, 0);
    if (nextSunday <= now) nextSunday.setDate(nextSunday.getDate() + 7);

    // JEE Advanced - Biweekly, upcoming (e.g., next Saturday)
    const nextSaturday = new Date();
    nextSaturday.setDate(now.getDate() + (6 - now.getDay()) % 7);
    nextSaturday.setHours(14, 0, 0, 0);
    if (nextSaturday <= now) nextSaturday.setDate(nextSaturday.getDate() + 7);

    const ContestProblem = require('./src/models/ContestProblem');

    await Contest.deleteMany({ $or: [
      { title: { $regex: /JEE (Mains|Advanced|Practice) (Weekly|Biweekly|Practice)? ?Contest/ } },
      { contestNumber: { $in: [484, 174, 101] } }
    ]});
    await ContestProblem.deleteMany({}); // Clear problems for simplicity in seeding

    const jeeMains = new Contest({
      contestNumber: 484,
      title: "JEE Mains Weekly Contest 484",
      type: "weekly",
      startTime: nextSunday,
      endTime: new Date(nextSunday.getTime() + 3 * 60 * 60 * 1000),
      difficulty: "jee-mains",
      bannerImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"
    });
    await jeeMains.save();

    const jeeAdvanced = new Contest({
      contestNumber: 174,
      title: "JEE Advanced Biweekly Contest 174",
      type: "biweekly",
      startTime: nextSaturday,
      endTime: new Date(nextSaturday.getTime() + 6 * 60 * 60 * 1000),
      difficulty: "jee-advanced",
      bannerImage: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000"
    });
    await jeeAdvanced.save();

    // Past Contest for testing Virtual Mode
    const pastContest = new Contest({
      contestNumber: 101,
      title: "JEE Practice Contest (Past)",
      type: "weekly",
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      difficulty: "jee-mains",
      bannerImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000"
    });
    await pastContest.save();

    // Add problems to JEE Mains
    const mainsProblems = [
      {
        contestId: jeeMains._id,
        title: "Projectile Motion on Inclined Plane",
        statement: "A particle is projected from the bottom of an inclined plane of angle 30 degrees...",
        inputType: "mcq_single",
        options: [{id: 'A', text: '10m/s'}, {id: 'B', text: '20m/s'}, {id: 'C', text: '30m/s'}, {id: 'D', text: '40m/s'}],
        correctAnswer: 'B',
        points: 4,
        difficulty: 'medium'
      },
      {
        contestId: jeeMains._id,
        title: "Chemical Bonding - Hybridization",
        statement: "The hybridization of the central atom in SF6 is...",
        inputType: "mcq_single",
        options: [{id: 'A', text: 'sp3'}, {id: 'B', text: 'sp3d'}, {id: 'C', text: 'sp3d2'}, {id: 'D', text: 'dsp2'}],
        correctAnswer: 'C',
        points: 4,
        difficulty: 'easy'
      }
    ];

    // Add problems to JEE Advanced
    const advancedProblems = [
      {
        contestId: jeeAdvanced._id,
        title: "Complex Numbers - Locus",
        statement: "Find the locus of z such that |z-1| = 2|z+1|...",
        inputType: "numeric",
        correctAnswer: "3.14",
        points: 8,
        difficulty: 'hard'
      }
    ];

    // Add problems to Past Contest
    const pastProblems = [
      {
        contestId: pastContest._id,
        title: "Kinematics - Relative Velocity",
        statement: "Two cars A and B are moving in the same direction...",
        inputType: "mcq_single",
        options: [{id: 'A', text: '5m/s'}, {id: 'B', text: '10m/s'}, {id: 'C', text: '15m/s'}, {id: 'D', text: '20m/s'}],
        correctAnswer: 'A',
        points: 4,
        difficulty: 'medium'
      }
    ];

    const mainsProblemDocs = await ContestProblem.insertMany(mainsProblems);
    const advancedProblemDocs = await ContestProblem.insertMany(advancedProblems);
    const pastProblemDocs = await ContestProblem.insertMany(pastProblems);

    jeeMains.problems = mainsProblemDocs.map(p => p._id);
    jeeAdvanced.problems = advancedProblemDocs.map(p => p._id);
    pastContest.problems = pastProblemDocs.map(p => p._id);

    await jeeMains.save();
    await jeeAdvanced.save();
    await pastContest.save();

    console.log('Contests and problems seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding contests:', err);
    process.exit(1);
  }
};

seedContests();
