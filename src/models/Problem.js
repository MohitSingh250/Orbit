const mongoose = require('mongoose');


const ProblemSchema = new mongoose.Schema({
title: { type: String, required: true, index: 'text' },
statement: { type: String, required: true },
topics: [{ type: String, index: true }], // multiple topics/tags
tags: [{ type: String, index: true }],
difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium', index: true },
badges: [{ type: String }], 
sources: [{ type: String }],
inputType: { type: String, enum: ['mcq_single','numeric','manual','expression'], default: 'mcq_single' },
options: [{ id: String, text: String }],
correctAnswer: mongoose.Schema.Types.Mixed,
numericTolerance: { type: Number, default: 1e-3 },
points: { type: Number, default: 1 },
hints: [{ level: Number, text: String }], 
similarProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
solution: { type: String },
createdAt: { type: Date, default: Date.now },
contestExclusive: { type: Boolean, default: false },
contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: function() { return this.contestExclusive; } },

});

ProblemSchema.index({ title: 'text', statement: 'text' });

module.exports = mongoose.model('Problem', ProblemSchema);