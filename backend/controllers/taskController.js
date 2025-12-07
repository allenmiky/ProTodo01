import Task from "../models/Task.js";


// ✅ Create Task
export const createTask = async (req, res) => {
  console.log("🟢 /api/tasks POST reached");
  console.log("📩 Body received:", req.body);
  console.log("👤 User from auth:", req.user);

  try {
    const { title, description, status, board, date, subtasks } = req.body;

    if (!title) return res.status(400).json({ message: "Title required" });
    if (!board) return res.status(400).json({ message: "Board required" });

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      user: req.user.id,
      board,
      date,
      subtasks: subtasks || [],
      pinned: false, // 👈 default state
    });

    return res.status(201).json({ success: true, task });
  } catch (err) {
    console.error("❌ Create task error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Get all Tasks (sorted — pinned first)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id || req.userId })
      .lean()
      .sort({ pinned: -1, createdAt: -1 }); // 👈 pinned tasks on top

    res.json({ success: true, tasks });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
};



// ✅ Update Task (generic update)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ success: true, task: updatedTask });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: err.message });
  }
};



// ✅ Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
};



// ✅ Toggle Pin / Unpin a Task
export const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.pinned = !task.pinned;
    await task.save();

    console.log(`⭐ ${task.pinned ? "Pinned" : "Unpinned"}: ${task.title}`);

    res.json({ success: true, task });
  } catch (err) {
    console.error("❌ Toggle Pin Error:", err);
    res.status(500).json({ message: err.message });
  }
};