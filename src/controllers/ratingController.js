const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const User = require('../models/User');
const Submission = require('../models/Submission');

/**
 * Finalize contest and update ratings.
 * - Uses a transaction to ensure atomic updates
 * - Fills participant.rank, ratingBefore, ratingAfter
 * - Updates user.rating and pushes into user.contestHistory
 *
 * NOTE: This uses a simple rating delta formula. Replace with ELO/Glicko2 if desired.
 */
const finalizeContest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const contest = await Contest.findById(req.params.id).session(session);
    if (!contest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.finalized) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Contest already finalized' });
    }

    if (!contest.ratingAffects) {
      // If contest doesn't affect ratings, still mark finalized but don't modify ratings
      contest.finalized = true;
      await contest.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.json({ message: 'Contest finalized (no rating changes)' });
    }

    // Make sure participants are up-to-date (in case some participants joined but have no submissions)
    // We compute scoreboard using participant.score and lastSubmissionAt
    contest.participants.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const atA = a.lastSubmissionAt ? new Date(a.lastSubmissionAt).getTime() : Infinity;
      const atB = b.lastSubmissionAt ? new Date(b.lastSubmissionAt).getTime() : Infinity;
      return atA - atB;
    });

    const total = contest.participants.length;

    // Basic rating delta: top gets +k, lower get less; negative deltas could be applied too
    // For simplicity, we'll apply symmetric deltas around zero if desired.
    // Here we give higher ranks positive delta, lower ranks zero (simple).
    for (let i = 0; i < total; i++) {
      const p = contest.participants[i];
      const rank = i + 1;
      p.rank = rank;

      const user = await User.findById(p.userId).session(session);
      if (!user) continue;

      // snapshot ratingBefore if not already set
      p.ratingBefore = (typeof p.ratingBefore === 'number') ? p.ratingBefore : user.rating;

      // Example delta: linear scaling: (total - rank) / total * K
      const K = 20; // tune this constant
      const delta = Math.round(((total - rank) / Math.max(1, total - 1)) * K);

      p.ratingAfter = p.ratingBefore + delta;

      // update user
      const ratingBeforeUser = user.rating;
      user.rating = p.ratingAfter;

      // push to user.contestHistory
      user.contestHistory = user.contestHistory || [];
      user.contestHistory.push({
        contestId: contest._id,
        score: p.score,
        rank,
        ratingBefore: ratingBeforeUser,
        ratingAfter: user.rating,
        participatedAt: new Date(),
      });

      await user.save({ session });
    }

    contest.finalized = true;
    await contest.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Contest finalized and ratings updated' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

module.exports = { finalizeContest };
