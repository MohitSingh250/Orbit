const Contest = require("../models/Contest");
const ContestProblem = require("../models/ContestProblem");
const User = require("../models/User");


const createContest = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "Start time must be before end time" });
    }

    const contest = new Contest(req.body);
    await contest.save();

    return res.status(201).json({ success: true, contest });
  } catch (err) {
    console.error("Create Contest Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addContestProblem = async (req, res) => {
  try {
    const { contestId } = req.params;
    const problemData = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const contestProblem = new ContestProblem({
      ...problemData,
      contestId,
    });

    await contestProblem.save();

    contest.problems.push(contestProblem._id);
    await contest.save();

    return res.status(201).json({
      success: true,
      message: "Contest problem added",
      problem: contestProblem,
    });
  } catch (err) {
    console.error("Add Contest Problem Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// REGISTER USER FOR CONTEST (updated for participant object)
// -------------------------------------------------------------
const registerForContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const exists = contest.participants.find(
      (p) => String(p.userId) === String(userId)
    );

    if (exists) {
      return res.json({ message: "Already registered" });
    }

    contest.participants.push({
      userId,
      score: 0,
      solved: 0,
      lastSubmissionAt: null,
    });

    await contest.save();

    return res.json({
      success: true,
      message: "Registered for contest successfully",
    });
  } catch (err) {
    console.error("Contest Registration Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// ENSURE UPCOMING CONTESTS (JEE Mains & Advanced)
// -------------------------------------------------------------
const ensureUpcomingContests = async () => {
  try {
    const now = new Date();
    const difficulties = ["jee-mains", "jee-advanced"];
    
    for (const diff of difficulties) {
      const upcoming = await Contest.findOne({
        difficulty: diff,
        startTime: { $gt: now }
      });

      if (!upcoming) {
        // Find max contest number
        const lastContest = await Contest.findOne().sort({ contestNumber: -1 });
        const nextNumber = (lastContest?.contestNumber || 0) + 1;
        
        // Calculate next Sunday at 10 AM (Mains) or 2 PM (Advanced)
        let nextStart = new Date();
        nextStart.setDate(nextStart.getDate() + (7 - nextStart.getDay()) % 7);
        nextStart.setHours(diff === "jee-mains" ? 10 : 14, 0, 0, 0);
        
        // If that time has already passed today, move to next week
        if (nextStart <= now) {
          nextStart.setDate(nextStart.getDate() + 7);
        }

        const nextEnd = new Date(nextStart.getTime() + 3 * 60 * 60 * 1000); // 3 hours later

        const newContest = new Contest({
          contestNumber: nextNumber,
          title: `Orbit Weekly Contest (${diff === "jee-mains" ? "JEE Mains" : "JEE Advanced"})`,
          type: "weekly",
          difficulty: diff,
          startTime: nextStart,
          endTime: nextEnd,
          bannerImage: diff === "jee-mains" ? "/store/mock_tests_v2.png" : "/store/physics_cheat_sheet_v2.png"
        });

        await newContest.save();
        console.log(`Auto-created upcoming contest: ${newContest.title}`);
      }
    }
  } catch (err) {
    console.error("Error in ensureUpcomingContests:", err);
  }
};

// -------------------------------------------------------------
// GET ALL CONTESTS
// -------------------------------------------------------------
const getContests = async (req, res) => {
  try {
    await ensureUpcomingContests();
    const contests = await Contest.find().sort({ startTime: 1 }).lean();
    return res.json({ success: true, contests });
  } catch (err) {
    console.error("Get Contests Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// GET SINGLE CONTEST WITH POPULATIONS
// -------------------------------------------------------------
// -------------------------------------------------------------
// GET SINGLE CONTEST WITH POPULATIONS (SECURE)
// -------------------------------------------------------------
const getContestById = async (req, res) => {
  try {
    const { contestId } = req.params;

    // 1. Fetch contest WITHOUT problems first
    const contest = await Contest.findById(contestId)
      .populate("participants.userId", "username rating avatar")
      .lean();

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // 2. Security Check: Has the contest started?
    const now = new Date();
    const isVirtual = req.query.virtual === "true";
    const hasStarted = now >= new Date(contest.startTime) || isVirtual;

    // 3. If started or virtual, fetch problems securely (excluding answers)
    if (hasStarted) {
      const mongoose = require('mongoose');
      const problems = await ContestProblem.find({ contestId: new mongoose.Types.ObjectId(contestId) })
        .select("-correctAnswer -solution")
        .lean();
      
      contest.problems = problems;
    } else {
      // If not started, hide problems entirely
      contest.problems = [];
    }

    return res.json({ success: true, contest });
  } catch (err) {
    console.error("Get Contest Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------------------
// DELETE CONTEST (+ DELETE ITS PROBLEMS)
// -------------------------------------------------------------
const deleteContest = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    await ContestProblem.deleteMany({ contestId });
    await contest.deleteOne();

    return res.json({ success: true, message: "Contest deleted" });
  } catch (err) {
    console.error("Delete Contest Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = {
  createContest,
  addContestProblem,
  registerForContest,
  getContests,
  getContestById,
  deleteContest,
};
