import Task from "../models/Task.js";

/* ================= CREATE TASK ================= */
export const createTask = async (req, res) => {
  try {
    const { title, priority, dueDate, project, status } = req.body;

    const task = await Task.create({
      title,
      priority,
      dueDate,
      project,
      status,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET TASKS BY PROJECT ================= */
export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE TASK ================= */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = req.body.status || task.status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};