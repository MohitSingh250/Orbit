const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const Contest = require("../models/Contest");
const ContestProblem = require("../models/ContestProblem");
const User = require("../models/User");
const compareAnswers = require("../utils/compareAnswers");

const submitAnswer = async (req, res, next) => {
  try {
    const { problemId, contestId, answer } = req.body;
    const userId = req.user._id;

    let problem = null;
    let contest = null;

    if (!contestId) {
      problem = await Problem.findById(problemId);
      if (!problem)
        return res.status(404).json({ message: "Practice problem not found" });
    }

    if (contestId) {
      contest = await Contest.findById(contestId);
      if (!contest)
        return res.status(404).json({ message: "Contest not found" });

      const now = new Date();
      if (now < contest.startTime)
        return res.status(400).json({ message: "Contest has not started yet" });
      if (now > contest.endTime)
        return res.status(400).json({ message: "Contest has ended" });

      const participant = contest.participants.find(
        (p) => String(p.userId) === String(userId)
      );
      if (!participant)
        return res.status(403).json({ message: "Join contest before submitting" });

      problem = await ContestProblem.findById(problemId);
      if (!problem)
        return res.status(404).json({ message: "Contest problem not found" });
    }

    const { correct, score, manual } = compareAnswers(problem, answer);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Submission.create(
        [
          {
            userId,
            problemId: contestId ? null : problemId,
            contestProblemId: contestId ? problemId : null,
            contestId: contestId || null,
            answer,
            isCorrect: correct,
            score: score || 0,
          },
        ],
        { session }
      );

      if (!contestId && correct) {
        const user = await User.findById(userId).session(session);

        const now = new Date();
        const today = now.toDateString();
        const lastDay = user.lastSolvedAt
          ? new Date(user.lastSolvedAt).toDateString()
          : null;

        if (lastDay === today) {
        } else if (lastDay && new Date(today) - new Date(lastDay) === 86400000) {
          user.currentStreak += 1;
        } else {
          user.currentStreak = 1;
        }

        user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
        user.lastSolvedAt = now;

        const alreadySolved = user.solvedProblems.some(
          (p) => String(p.problemId) === String(problemId)
        );

        if (!alreadySolved) {
          user.solvedProblems.push({ problemId, solvedAt: now });
        }

        await user.save({ session });
      }

      if (contestId) {
        const participant = contest.participants.find(
          (p) => String(p.userId) === String(userId)
        );

        const alreadySolved = await Submission.findOne({
          userId,
          contestId,
          contestProblemId: problemId,
          isCorrect: true,
        }).session(session);

        participant.lastSubmissionAt = new Date();

        if (!alreadySolved && correct) {
          participant.score += score;
          participant.solved += 1;
        }

        await contest.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Submitted successfully",
        correct,
        score: score || 0,
        manual,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return next(err);
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

const getSubmissionsForProblem = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const submissions = await Submission.find({ 
      userId, 
      $or: [
        { problemId },
        { contestProblemId: problemId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

const submitBulkAnswers = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { contestId, submissions } = req.body;
    const userId = req.user._id;

    if (!contestId || !Array.isArray(submissions)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid payload" });
    }

    const contest = await Contest.findById(contestId).session(session);
    if (!contest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Contest not found" });
    }

    const now = new Date();
    if (now < contest.startTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Contest has not started yet" });
    }
    if (now > contest.endTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Contest has ended" });
    }

    const participant = contest.participants.find(
      (p) => String(p.userId) === String(userId)
    );
    if (!participant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Join contest before submitting" });
    }

    let totalScoreToAdd = 0;
    let totalSolvedToAdd = 0;

    for (const sub of submissions) {
      const { problemId, answer } = sub;
      if (!problemId) continue;

      const problem = await ContestProblem.findById(problemId).session(session);
      if (!problem) continue;

      // Check if already solved correctly
      const existing = await Submission.findOne({
        userId,
        contestId,
        contestProblemId: problemId,
        isCorrect: true,
      }).session(session);

      if (existing) continue;

      const { correct, score } = compareAnswers(problem, answer);

      await Submission.create(
        [
          {
            userId,
            contestId,
            contestProblemId: problemId,
            answer,
            isCorrect: correct,
            score: score || 0,
          },
        ],
        { session }
      );

      if (correct) {
        totalScoreToAdd += score || 0;
        totalSolvedToAdd += 1;
      }
    }

    participant.score += totalScoreToAdd;
    participant.solved += totalSolvedToAdd;
    participant.lastSubmissionAt = new Date();
    participant.isSubmitted = true;

    await contest.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Bulk submission successful" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

module.exports = { submitAnswer, getSubmissionsForUser, getSubmissionsForProblem, submitBulkAnswers };
