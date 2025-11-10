const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', index: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', index: true, default: null },
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  timeTakenMs: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

SubmissionSchema.index({ problemId: 1 });
SubmissionSchema.index({ userId: 1, problemId: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
