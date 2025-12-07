const Contest = require("../models/Contest");
const User = require("../models/User"); // Ensure User model is registered

const getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId)
      .populate("participants.userId", "username rating avatar")
      .lean();

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Extract leaderboard data
    let leaderboard = contest.participants.map((p) => ({
      user: p.userId,
      score: p.score,
      solved: p.solved,
      lastSubmissionAt: p.lastSubmissionAt,
    }));

    // Sorting rules:
    leaderboard.sort((a, b) => {
      // 1️⃣ Score DESC
      if (b.score !== a.score) return b.score - a.score;

      // 2️⃣ Solved DESC
      if (b.solved !== a.solved) return b.solved - a.solved;

      // 3️⃣ Earlier submission wins
      if (a.lastSubmissionAt && b.lastSubmissionAt) {
        return new Date(a.lastSubmissionAt) - new Date(b.lastSubmissionAt);
      }

      return 0;
    });

    return res.json({
      success: true,
      leaderboard,
    });
  } catch (err) {
    console.error("Leaderboard Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ rating: -1 })
      .limit(10)
      .select("username rating avatar contestHistory")
      .lean();

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      name: u.username,
      rating: u.rating,
      attended: u.contestHistory?.length || 0,
      avatar: u.avatar || "https://assets.leetcode.com/users/avatars/avatar_1.png" // Fallback
    }));

    return res.json({ success: true, leaderboard });
  } catch (err) {
    console.error("Global Leaderboard Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getLeaderboard, getGlobalLeaderboard };
