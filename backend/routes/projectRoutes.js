import express from "express";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PROJECT
router.post("/", authMiddleware, async (req, res) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      owner: req.user.id,
      members: [req.user.id]
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER PROJECTS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;