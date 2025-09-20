const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', index: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', index: true, sparse: true },
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
