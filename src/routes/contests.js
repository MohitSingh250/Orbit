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

router.post("/", auth,requireRole('admin'), createContest);
router.post("/:contestId/problems", auth,requireRole('admin'), addContestProblem);
router.post("/:contestId/register", auth, registerForContest);

router.get("/", getContests);
router.get("/:contestId", getContestById);

router.delete("/:contestId", auth,requireRole('admin'), deleteContest);

module.exports = router;
