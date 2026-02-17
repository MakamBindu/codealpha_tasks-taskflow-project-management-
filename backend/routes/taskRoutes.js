import express from "express";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= CREATE TASK ================= */
router.post("/", protect, async (req, res) => {
  try {
    const { title, priority, dueDate, project, status } = req.body;

    if (!project)
      return res.status(400).json({ message: "Project ID required" });

    const newTask = await Task.create({
      title,
      priority,
      dueDate,
      project,
      status,
      owner: req.user._id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: "Task creation failed" });
  }
});

/* ================= GET TASKS BY PROJECT ================= */
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("FETCH TASK ERROR:", error);
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* ================= UPDATE TASK ================= */
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ================= DELETE TASK ================= */
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;