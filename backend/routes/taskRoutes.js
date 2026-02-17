import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   CREATE TASK
========================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, project, status } = req.body;

    const task = await Task.create({
      title,
      project,
      status: status || "todo",
      owner: req.user._id,
    });

    const populatedTask = await task.populate("project");

    res.status(201).json(populatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Task creation failed" });
  }
});

/* =========================
   GET TASKS
========================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).populate(
      "project"
    );

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

/* =========================
   UPDATE STATUS
========================= */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = req.body.status || task.status;
    await task.save();

    const updated = await task.populate("project");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;