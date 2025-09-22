const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['student'] },
  rating: { type: Number, default: 1500 },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  contestsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }],
  notes: [NoteSchema],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  currentStreak: { type: Number, default: 0 },      
  longestStreak: { type: Number, default: 0 },      
  lastSolvedAt: { type: Date },                     
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
