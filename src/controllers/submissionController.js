const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const User = require('../models/User');
const compareAnswers = require('../utils/compareAnswers');

/**
 * Submit answer for normal or contest problem
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { problemId, contestId, answer } = req.body;
    const userId = req.user._id;

    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    let contest = null;
    if (contestId) {
      contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ message: 'Contest not found' });

      const now = new Date();
      if (now < new Date(contest.startTime)) {
        return res.status(400).json({ message: 'Contest has not started yet' });
      }
      if (now > new Date(contest.endTime)) {
        return res.status(400).json({ message: 'Contest has ended' });
      }

      // must join contest first
      const joined = contest.participants.find(
        (p) => String(p.userId) === String(userId)
      );
      if (!joined)
        return res.status(403).json({ message: 'Join contest before submitting' });
    }

    // Compare answers using your logic
    const { correct, score, manual } = compareAnswers(problem, answer);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ Create submission record
      const [submission] = await Submission.create(
        [
          {
            userId,
            problemId,
            contestId: contest ? contest._id : null,
            answer,
            isCorrect: !!correct,
            score: correct ? score : 0,
            verdict: manual ? 'Manual' : correct ? 'Accepted' : 'Wrong Answer',
            createdAt: new Date(),
          },
        ],
        { session }
      );

      /**
       * ✅ CASE 1: Normal problem submission
       * update streak, solvedProblems, and stats
       */
      if (!contest && correct) {
        const user = await User.findById(userId).session(session);
        const now = new Date();
        const today = now.toDateString();
        const lastSolved = user.lastSolvedAt
          ? new Date(user.lastSolvedAt).toDateString()
          : null;

        // Streak logic
        if (lastSolved === today) {
          // already solved today → no change
        } else if (
          lastSolved &&
          (new Date(today).getTime() - new Date(lastSolved).getTime()) /
            (1000 * 60 * 60 * 24) === 1
        ) {
          user.currentStreak = (user.currentStreak || 0) + 1;
        } else {
          user.currentStreak = 1;
        }

        if (!user.longestStreak || user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }

        user.lastSolvedAt = now;

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

      /**
       * ✅ CASE 2: Contest submission
       * update participant score/solved/lastSubmissionAt
       */
      if (contest) {
        const participant = contest.participants.find(
          (p) => String(p.userId) === String(userId)
        );
        if (participant) {
          participant.lastSubmissionAt = new Date();

          // check if user already accepted this problem before
          const alreadyAccepted = await Submission.findOne({
            userId,
            contestId,
            problemId,
            isCorrect: true,
          }).session(session);

          // only add score on FIRST correct submission
          if (!alreadyAccepted && correct) {
            participant.score += score || 0;
            participant.solved += 1;
          }

          await contest.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: 'Submission recorded successfully',
        verdict: manual ? 'Manual' : correct ? 'Accepted' : 'Wrong Answer',
        correct: !!correct,
        score: correct ? score : 0,
        contest: !!contest,
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

/**
 * Get all submissions for a user (normal + contest)
 */
const getSubmissionsForUser = async (req, res, next) => {
  try {
    const { contestId, problemId } = req.query;
    const userId = req.params.userId;

    const filter = { userId };
    if (contestId) filter.contestId = contestId;
    if (problemId) filter.problemId = problemId;

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty points')
      .populate('contestId', 'title startTime endTime')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ submissions });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitAnswer, getSubmissionsForUser };
