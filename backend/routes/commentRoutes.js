const router = require("express").Router();
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware");

// Add Comment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.create({
      text: req.body.text,
      task: req.body.taskId,
      user: req.user.id
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Get Comments for Task
router.get("/:taskId", authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId
    }).populate("user", "name");

    res.json(comments);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;