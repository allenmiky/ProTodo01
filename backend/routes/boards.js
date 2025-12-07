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

// ✅ DELETE CUSTOM COLUMN ROUTE - Add this before export
router.delete('/:boardId/custom-column/:columnName', auth, async (req, res) => {
  try {
    const { boardId, columnName } = req.params;
    const userId = req.user?.id || req.user?._id;

    console.log(`Deleting custom column: ${columnName} from board: ${boardId}`);

    // ✅ Validate - built-in columns cannot be deleted
    if (['todo', 'inprogress', 'done'].includes(columnName)) {
      return res.status(400).json({ 
        message: 'Cannot delete built-in columns' 
      });
    }

    // ✅ Find board and verify ownership
    const board = await Board.findOne({ _id: boardId, user: userId });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // ✅ Import Task model at the top of file
    const Task = await import('../models/Task.js').then(m => m.default);
    
    // ✅ Delete tasks in this custom column
    const deleteResult = await Task.deleteMany({ 
      board: boardId, 
      status: columnName 
    });

    console.log(`Deleted ${deleteResult.deletedCount} tasks from column: ${columnName}`);

    res.json({ 
      message: `Custom column "${columnName}" deleted successfully`,
      deletedTasks: deleteResult.deletedCount
    });

  } catch (error) {
    console.error('Delete custom column error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
