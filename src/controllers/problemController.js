const mongoose = require("mongoose");
const Problem = require("../models/Problem");

const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (err) {
    next(err);
  }
};

const listProblems = async (req, res, next) => {
  try {
    const { q, topic, tags, difficulty, page = 1, limit = 20 } = req.query;

    const filters = {};

    if (q && q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filters.$or = [{ title: regex }, { statement: regex }];
    }

    if (topic && topic.trim()) {
      const regex = new RegExp(topic.trim(), "i");
      filters.topics = { $elemMatch: regex };
    }

    if (tags && tags.trim()) {
      const tagArray = tags
        .split(",")
        .map((t) => new RegExp(t.trim(), "i"))
        .filter(Boolean);
      filters.tags = { $in: tagArray };
    }

    if (difficulty && difficulty.trim()) {
      const regex = new RegExp(difficulty.trim(), "i");
      filters.difficulty = regex;
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
