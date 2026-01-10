const Contest = require("../models/Contest");
const User = require("../models/User"); // Ensure User model is registered

const getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId)
      .populate("participants.userId", "username rating avatar location")
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
    const limit = 50;
    const users = await User.find()
      .sort({ rating: -1, _id: 1 }) // Stable sort
      .limit(limit)
      .select("username rating avatar contestHistory location")
      .lean();

    const totalParticipants = await User.countDocuments();

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      name: u.username,
      rating: u.rating,
      attended: u.contestHistory?.length || 0,
      avatar: u.avatar || "https://assets.leetcode.com/users/avatars/avatar_1.png", // Fallback
      state: u.location || ""
    }));

    let userRank = null;
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select("username rating avatar contestHistory location").lean();
      if (currentUser) {
        // Find rank by counting users with higher rating OR same rating but smaller _id (stable sort order)
        const higherRankedCount = await User.countDocuments({
          $or: [
            { rating: { $gt: currentUser.rating } },
            { rating: currentUser.rating, _id: { $lt: currentUser._id } }
          ]
        });
        
        userRank = {
          rank: higherRankedCount + 1,
          userId: currentUser._id,
          name: currentUser.username,
          rating: currentUser.rating,
          attended: currentUser.contestHistory?.length || 0,
          avatar: currentUser.avatar || "https://assets.leetcode.com/users/avatars/avatar_1.png",
          state: currentUser.location || "",
          isMe: true
        };
      }
    }

    return res.json({ 
      success: true, 
      leaderboard, 
      totalParticipants,
      userRank
    });
  } catch (err) {
    console.error("Global Leaderboard Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getLeaderboard, getGlobalLeaderboard };
