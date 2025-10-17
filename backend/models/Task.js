import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "todo" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    date: { type: String }, // ✅ Add this line if not present
  },
  { timestamps: true }
);


const Task = mongoose.model("Task", taskSchema);
export default Task;
