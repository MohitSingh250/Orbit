const mongoose = require("mongoose");
const Problem = require("../models/Problem");

const createProblem = async (req, res, next) => {
  try {
    const payload = req.body;
    const problem = await Problem.create(payload);
    res.status(201).json(problem);
  } catch (err) {
    next(err);
  }
};

const listProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, tags, q, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (q) {
      filters.$or = [
        { title: { $regex: q, $options: "i" } },
        { statement: { $regex: q, $options: "i" } },
      ];
    }

    if (topic) {
      filters.topics = { $in: [new RegExp(topic.trim(), "i")] };
    }

    if (difficulty) {
      filters.difficulty = { $regex: `^${difficulty.trim()}$`, $options: "i" };
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim());
      filters.tags = { $in: tagArray.map((t) => new RegExp(t, "i")) };
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const problems = await Problem.find(filters)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Problem.countDocuments(filters);

    res.json({
      problems,
      total,
      hasMore: total > skip + problems.length,
    });
  } catch (err) {
    next(err);
  }
};

const getProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const problem = await Problem.findById(id).lean();
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    res.json(problem);
  } catch (err) {
    next(err);
  }
};

module.exports = { createProblem, listProblems, getProblem };
