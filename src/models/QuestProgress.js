const mongoose = require('mongoose');

const questProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
  completedNodes: [{ type: Number }], // array of node IDs
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }], // array of solved problem IDs
  activeNode: { type: Number, default: 1 },
  stars: { type: Number, default: 0 },
  chestsOpened: [{ type: Number }], // array of chest IDs
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for unique progress per user per quest
questProgressSchema.index({ userId: 1, questId: 1 }, { unique: true });

module.exports = mongoose.model('QuestProgress', questProgressSchema);
