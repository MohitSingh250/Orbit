const express = require("express");
const router = express.Router();

const { getLeaderboard, getGlobalLeaderboard } = require("../controllers/leaderboardController");
const { optionalAuth } = require("../middlewares/auth");

router.get("/global", optionalAuth, getGlobalLeaderboard);
router.get("/:contestId", getLeaderboard);

module.exports = router;
