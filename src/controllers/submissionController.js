const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const User = require('../models/User');
const compareAnswers = require('../utils/compareAnswers');

const submitAnswer = async (req, res, next) => {
  try {
    const { problemId, contestId, answer } = req.body;
    const userId = req.user._id;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    let contest = null;
    if (contestId) {
      contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ message: 'Contest not found' });

      const now = new Date();
      if (now < new Date(contest.startTime) || now > new Date(contest.endTime)) {
        return res.status(400).json({ message: 'Outside contest time window' });
      }

      const joined = contest.participants.find(p => String(p.userId) === String(userId));
      if (!joined) return res.status(403).json({ message: 'Join contest before submitting' });
    }

    const { correct, score, manual } = compareAnswers(problem, answer);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const submission = await Submission.create([{
        userId,
        problemId,
        contestId,
        answer,
        isCorrect: !!correct,
        score: score || 0,
      }], { session });

      if (correct) {
        const user = await User.findById(userId).session(session);
        const today = new Date().toDateString();
        const lastSolved = user.lastSolvedAt ? new Date(user.lastSolvedAt).toDateString() : null;

        if (lastSolved === today) {
          // Already solved today → streak unchanged
        } else if (lastSolved && (new Date(today) - new Date(lastSolved)) / (1000 * 60 * 60 * 24) === 1) {
          // Solved yesterday → streak++
          user.currentStreak = (user.currentStreak || 0) + 1;
        } else {
          // Missed days → reset streak
          user.currentStreak = 1;
        }

        // Update longest streak
        if (!user.longestStreak || user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }

        user.lastSolvedAt = new Date();

        // ✅ Save solved problem too
        await User.updateOne(
          { _id: userId, solvedProblems: { $ne: problem._id } },
          { 
            $addToSet: { solvedProblems: problem._id },
            $set: { 
              currentStreak: user.currentStreak,
              longestStreak: user.longestStreak,
              lastSolvedAt: user.lastSolvedAt
            }
          },
          { session }
        );
      }

      if (contest) {
        const pIndex = contest.participants.findIndex(p => String(p.userId) === String(userId));
        if (pIndex !== -1) {
          const alreadySolved = await Submission.findOne({
            userId,
            contestId,
            problemId,
            isCorrect: true
          }).session(session);

          if (!(alreadySolved && alreadySolved._id)) {
            if (correct) {
              contest.participants[pIndex].score += score || 0;
              contest.participants[pIndex].solved += 1;
              contest.participants[pIndex].lastSubmissionAt = new Date();
              await contest.save({ session });
            } else {
              contest.participants[pIndex].lastSubmissionAt = new Date();
              await contest.save({ session });
            }
          } else {
            contest.participants[pIndex].lastSubmissionAt = new Date();
            await contest.save({ session });
          }
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Submitted',
        correct: !!correct,
        score: score || 0,
        manual: !!manual
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

const getSubmissionsForUser = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.params.userId })
      .sort({ submittedAt: -1 })
      .limit(200);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitAnswer, getSubmissionsForUser };
