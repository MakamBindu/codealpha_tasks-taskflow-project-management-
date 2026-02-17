import express from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= GET PROJECTS ================= */
router.get("/", protect, async (req, res) => {
  const projects = await Project.find({
    owner: req.user._id,
  });
  res.json(projects);
});

/* ================= CREATE PROJECT ================= */
router.post("/", protect, async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    owner: req.user._id,
    members: [req.user._id],
  });

  res.status(201).json(project);
});

/* ================= DELETE PROJECT ================= */
router.delete("/:id", protect, async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project)
    return res.status(404).json({ message: "Project not found" });

  if (project.owner.toString() !== req.user._id.toString())
    return res.status(401).json({ message: "Not authorized" });

  await project.deleteOne();

  // Delete related tasks
  await Task.deleteMany({ project: req.params.id });

  res.json({ message: "Project deleted" });
});

export default router;