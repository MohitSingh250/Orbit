const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String },
  type: { type: String, enum: ['node', 'chest', 'mystery'], default: 'node' },
  problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
});

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  nodes: [nodeSchema],
});

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true }, // physics, chemistry, maths
  totalLevels: { type: Number, required: true },
  sections: [sectionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quest', questSchema);
