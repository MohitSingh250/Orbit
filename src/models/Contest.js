const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,

  problems: [
    {
      problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      order: Number
    }
  ],

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: Date,
      lastSubmissionAt: Date,
      score: { type: Number, default: 0 },
      solved: { type: Number, default: 0 }
    }
  ]
});

module.exports = mongoose.model("Contest", ContestSchema);
