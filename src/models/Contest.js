const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  contestNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },

  type: {
    type: String,
    enum: ["weekly", "biweekly", "mock-jee", "special"],
    default: "weekly"
  },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },


  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard", "jee-mains", "jee-advanced"],
    default: "medium"
  },

  // Contest problems
  problems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContestProblem"
    }
  ],

  // UPDATED PARTICIPANT SYSTEM (REQUIRED)
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      score: { type: Number, default: 0 },
      solved: { type: Number, default: 0 },
      lastSubmissionAt: { type: Date, default: null },
      isSubmitted: { type: Boolean, default: false }
    }
  ],

  isVirtual: { type: Boolean, default: false },
  bannerImage: { type: String, default: null }
},
{
  timestamps: true
});


contestSchema.virtual("status").get(function () {
  const now = Date.now();

  if (now < this.startTime) return "upcoming";
  if (now > this.endTime) return "completed";
  return "live";
});
// Virtual: Contest duration in milliseconds
contestSchema.virtual("duration").get(function () {
  return this.endTime.getTime() - this.startTime.getTime();
});

module.exports = mongoose.model("Contest", contestSchema);
