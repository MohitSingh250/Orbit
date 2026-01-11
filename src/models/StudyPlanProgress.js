const mongoose = require('mongoose');

const studyPlanProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  schedule: {
    problemsPerDay: { type: Number, default: 0 },
    daysOfWeek: [{ type: String }] // e.g., ['MON', 'WED', 'FRI']
  },
  isCompleted: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPlanProgress', studyPlanProgressSchema);
