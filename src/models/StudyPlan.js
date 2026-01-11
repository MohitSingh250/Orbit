const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Day 1: Arrays", "Week 1"
  problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }]
});

const studyPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: String }, // e.g., "Interview", "JEE", "SQL"
  summary: [{ type: String }],
  relatedPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan' }],
  isFeatured: { type: Boolean, default: false },
  modules: [moduleSchema],
  totalProblems: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Calculate total problems before saving
studyPlanSchema.pre('save', function(next) {
  this.totalProblems = this.modules.reduce((acc, mod) => acc + mod.problemIds.length, 0);
  next();
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
