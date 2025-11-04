const mongoose = require('mongoose');
const ContestParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  solved: { type: Number, default: 0 },
  lastSubmissionAt: { type: Date, default: null },
  rank: { type: Number, default: null },
  ratingBefore: { type: Number, default: null },
  ratingAfter: { type: Number, default: null }
}, { _id: false });


const ContestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  ratingAffects: { type: Boolean, default: true },
  participants: [ContestParticipantSchema],
  finalized: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

ContestSchema.index({ startTime: 1, endTime: 1 });


module.exports = mongoose.model('Contest', ContestSchema);
