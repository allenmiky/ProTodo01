import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";
const router = express.Router();

// ✅ Get all tasks for a board (Pinned always on top)
router.get("/:boardId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .lean()
      .sort({ pinned: -1, createdAt: -1 }); // pinned tasks first

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Create a new task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, board, date, subtasks } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!board) return res.status(400).json({ message: "Board ID is required" });

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      board,
      user: req.user.id,
      date,
      subtasks: subtasks || [],
      pinned: false, // default
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Task creation error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update a task (generic update)
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid task ID" });

  try {
    // ✅ Fix: ensure history is array of strings only
    if (req.body.history && Array.isArray(req.body.history)) {
      req.body.history = req.body.history.flat().filter(item => typeof item === "string");
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.json(updatedTask);
  } catch (err) {
    console.error("❌ Task update error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Toggle Pin / Unpin a task
router.patch("/:id/pin", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.pinned = !task.pinned;
    await task.save();

    res.json({ pinned: task.pinned, message: task.pinned ? "Task pinned" : "Task unpinned" });
  } catch (err) {
    console.error("❌ Pin toggle error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ Task delete error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
