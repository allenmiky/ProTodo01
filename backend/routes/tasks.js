import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Get tasks for a specific board
router.get("/:boardId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Create a new task for a board
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, board, date } = req.body; // ✅ added date here

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!board) {
      return res.status(400).json({ message: "Board ID is required" });
    }

    const task = new Task({
      title,
      description,
      status: status || "todo",
      board,
      user: req.user.id,
      date, // ✅ store date in DB
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Task creation error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ Update a task
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
