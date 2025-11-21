const mongoose = require("mongoose");

const ContestProblemSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    index: true,
    required: true
  },

  title: {
    type: String,
    required: true,
  },

  statement: {
    type: String,
    required: true,
  },

  inputType: {
    type: String,
    enum: ["mcq_single", "numeric", "manual", "expression"],
    default: "mcq_single",
  },

  // For MCQ problems
  options: [
    {
      id: String,
      text: String,
    }
  ],

  // Answer of any type
  correctAnswer: mongoose.Schema.Types.Mixed,

  // Numeric precision for numeric problems
  numericTolerance: {
    type: Number,
    default: 1e-3,
  },

  points: {
    type: Number,
    default: 1,
  },

  // Optional: Difficulty separate from contest difficulty
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },

  // Optional: Editorial/solution reference
  solution: {
    type: String,
    default: "",
  }
},
{
  timestamps: true,
});

module.exports = mongoose.model("ContestProblem", ContestProblemSchema);
