require('dotenv').config();
const mongoose = require('mongoose');
const Quest = require('./src/models/Quest');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const quests = await Quest.find().lean();
    console.log(`Found ${quests.length} quests`);
    
    if (quests.length > 0) {
      const q = quests[0];
      console.log('Quest Title:', q.title);
      if (q.sections && q.sections.length > 0) {
        const section = q.sections[0];
        console.log('Section:', section.title);
        if (section.nodes && section.nodes.length > 0) {
          console.log('Nodes:', JSON.stringify(section.nodes, null, 2));
        }
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
