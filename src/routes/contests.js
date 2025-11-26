const express = require("express");
const router = express.Router();

const {
  createContest,
  addContestProblem,
  registerForContest,
  getContests,
  getContestById,
  deleteContest
} = require("../controllers/contestController");

const {auth, requireRole} = require("../middlewares/auth");

router.post("/", auth, createContest);
router.post("/:contestId/problems", addContestProblem);
router.post("/:contestId/register", auth, registerForContest);

router.get("/", getContests);
router.get("/:contestId", getContestById);

router.delete("/:contestId", auth, deleteContest);

module.exports = router;
