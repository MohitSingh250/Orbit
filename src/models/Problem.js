const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' },
  statement: { type: String, required: true }, 
  topic: { type: String, index: true },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium', index: true },
  inputType: { type: String, enum: ['mcq_single','numeric','manual'], default: 'mcq_single' },
  options: [{ id: String, text: String }], 
  correctAnswer: mongoose.Schema.Types.Mixed, 
  numericTolerance: { type: Number, default: 1e-3 }, 
  points: { type: Number, default: 1 },
  solution: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', ProblemSchema);
