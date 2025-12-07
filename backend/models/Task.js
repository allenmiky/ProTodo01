import mongoose from "mongoose";

// Subtask schema
const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, default: "todo" },
  date: { type: String },
  completed: { type: Boolean, default: false },
});

// Main Task schema
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "todo" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    date: { type: String },

    // Completion tracking like Trello ✅
    completed: { type: Boolean, default: false },
    history: { type: [String], default: [] }, 

    // Nested tasks
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    subtasks: [SubtaskSchema],

    // ⭐ Pinning feature
    pinned: { type: Boolean, default: false },  // 👈 add this line
  },
  { timestamps: true }
);


const Task = mongoose.model("Task", taskSchema);
export default Task;
