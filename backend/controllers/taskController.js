import Task from "../models/Task.js";

// ✅ Create Task
export const createTask = async (req, res) => {
  console.log("🟢 /api/tasks POST reached");
  console.log("📩 Body received:", req.body);
  console.log("👤 User from auth:", req.user);

  try {
    const { title, description, status, board } = req.body;

    if (!title) {
      console.log("❌ Missing title");
      return res.status(400).json({ message: "Title is required" });
    }

    if (!board) {
      console.log("❌ Missing board id");
      return res.status(400).json({ message: "Board is required" });
    }

    if (!req.user || !req.user.id) {
      console.log("❌ Missing user info");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newTask = await Task.create({
      title,
      description,
      status: status || "todo",
      user: req.user.id,
      board, // required in schema
    });

    console.log("✅ Task created:", newTask);
    return res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all Tasks (for logged-in user)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id || req.userId });
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });

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
