// src/components/AddTaskModal.jsx
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  column,
  task,
  darkMode, // 👈 prop se theme aayega
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (task && Object.keys(task).length > 0) {
      // Editing existing task
      setTitle(task.title || "");
      setDesc(task.desc || task.description || "");
      setDate(task.date || "");
    } else {
      // Adding new task
      setTitle("");
      setDesc("");
      setDate("");
    }
  }, [task, isOpen]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      _id: task?._id || task?.id,
      id: task?._id || task?.id || Date.now().toString(),
      title: title.trim(),
      desc: desc.trim(),
      date,
    };

    if (task && Object.keys(task).length > 0) {
      onUpdate(newTask);
    } else {
      onSave(newTask, column);
    }

    onClose();
  };


  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl animate-slideIn
          ${darkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-slate-200"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold
            ${darkMode ? "text-gray-100" : "text-gray-800"}
          `}>
            {task ? "Edit Task" : "Add Task"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition
              ${darkMode
                ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                : "hover:bg-slate-100 text-gray-600 hover:text-gray-900"
              }`}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block mb-1 text-sm font-medium
              ${darkMode ? "text-gray-300" : "text-gray-700"}
            `}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${darkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-slate-300 text-gray-900"
                }`}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block mb-1 text-sm font-medium
              ${darkMode ? "text-gray-300" : "text-gray-700"}
            `}>Description</label>
            <textarea
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none
                ${darkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-slate-300 text-gray-900"
                }`}
              placeholder="Enter short description"
            ></textarea>
          </div>

          {/* Due Date */}
          <div>
            <label className={`block mb-1 text-sm font-medium
              ${darkMode ? "text-gray-300" : "text-gray-700"}
            `}>Due Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${darkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-slate-300 text-gray-900"
                }`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold transition-all"
          >
            {task ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}