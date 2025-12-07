const express = require("express");
const router = express.Router();

const { getLeaderboard, getGlobalLeaderboard } = require("../controllers/leaderboardController");

router.get("/global", getGlobalLeaderboard);
router.get("/:contestId", getLeaderboard);

module.exports = router;
