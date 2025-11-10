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

      const joined = contest.participants.find(
        (p) => String(p.userId) === String(userId)
      );
      if (!joined)
        return res.status(403).json({ message: 'Join contest before submitting' });
    }

    // Compare answer
    const { correct, score, manual } = compareAnswers(problem, answer);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // ✅ Create submission
      const submission = await Submission.create(
        [
          {
            userId,
            problemId,
            contestId,
            answer,
            isCorrect: !!correct,
            score: score || 0,
          },
        ],
        { session }
      );

      // ✅ Update streak + solved problems if correct
      if (correct) {
        const user = await User.findById(userId).session(session);
        const now = new Date();
        const today = now.toDateString();
        const lastSolved = user.lastSolvedAt
          ? new Date(user.lastSolvedAt).toDateString()
          : null;

        // 🔥 Handle streak logic
        if (lastSolved === today) {
          // already solved today → no change
        } else if (
          lastSolved &&
          (new Date(today) - new Date(lastSolved)) / (1000 * 60 * 60 * 24) === 1
        ) {
          // solved yesterday → increment
          user.currentStreak = (user.currentStreak || 0) + 1;
        } else {
          // missed a day → reset
          user.currentStreak = 1;
        }

        // update longest streak
        if (!user.longestStreak || user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }

        user.lastSolvedAt = now;

        // ✅ Only add if problem not already solved
        const alreadySolved = user.solvedProblems.some(
          (p) => String(p.problemId) === String(problemId)
        );

        if (!alreadySolved) {
          user.solvedProblems.push({
            problemId: problem._id,
            solvedAt: now,
          });
        }

        await user.save({ session });
      }

      // ✅ Update contest data if applicable
      if (contest) {
        const pIndex = contest.participants.findIndex(
          (p) => String(p.userId) === String(userId)
        );
        if (pIndex !== -1) {
          const alreadySolved = await Submission.findOne({
            userId,
            contestId,
            problemId,
            isCorrect: true,
          }).session(session);

          const participant = contest.participants[pIndex];
          participant.lastSubmissionAt = new Date();

          if (!(alreadySolved && alreadySolved._id) && correct) {
            participant.score += score || 0;
            participant.solved += 1;
          }

          await contest.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: 'Submitted successfully',
        correct: !!correct,
        score: score || 0,
        manual: !!manual,
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
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitAnswer, getSubmissionsForUser };
