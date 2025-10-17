import express from "express";
import auth from "../middleware/auth.js";
import Board from "../models/Board.js";

const router = express.Router();

// ✅ Get all boards for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const boards = await Board.find({ user: userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    console.error("GET /boards error:", err);
    res.status(500).json({ message: "Error fetching boards" });
  }
});

// ✅ Create a new board
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Board name required" });

    const userId = req.user?.id || req.user?._id;
    const newBoard = new Board({ name, user: userId });
    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (err) {
    console.error("POST /boards error:", err);
    res.status(500).json({ message: "Error creating board" });
  }
});

// ✅ Archive (toggle true)
router.patch("/:id/archive", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { archived: true },
      { new: true }
    );
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    console.error("Archive error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Restore (toggle false)
router.patch("/:id/restore", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { archived: false },
      { new: true }
    );
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete board
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const board = await Board.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json({ message: "Board deleted successfully" });
  } catch (err) {
    console.error("DELETE /boards/:id error:", err);
    res.status(500).json({ message: "Error deleting board" });
  }
});

export default router;
