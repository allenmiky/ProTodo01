import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    archived: { type: Boolean, default: false },
    lists: {
      todo: { type: Array, default: [] },
      inprogress: { type: Array, default: [] },
      done: { type: Array, default: [] },
    },
  },
  { timestamps: true }
);

const Board = mongoose.model("Board", boardSchema);
export default Board;
