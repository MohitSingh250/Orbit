const mongoose = require('mongoose');

const ContestParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, default: 0 },
  solved: { type: Number, default: 0 },
  lastSubmissionAt: Date
}, { _id: false });

const ContestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  participants: [ContestParticipantSchema],
  createdAt: { type: Date, default: Date.now }
});

ContestSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Contest', ContestSchema);
