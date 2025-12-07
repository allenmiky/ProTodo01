import React, { useState, useRef } from "react";
import { FiX } from "react-icons/fi";
import useOutsideClick from "../hooks/useOutsideClick";

export default function AddBoardModal({ isOpen, onClose, onConfirm, darkMode }) {
  const [boardName, setBoardName] = useState("");
  const menuRef = useRef(); // ✅  

  useOutsideClick(menuRef, onClose);  

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!boardName.trim()) return;
    onConfirm(boardName.trim());
    setBoardName("");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center 
      ${darkMode ? "bg-black/50" : "bg-gray-800/30"} backdrop-blur-sm`}
    >
      <div
        ref={menuRef} // ✅ important
        className={`w-full max-w-sm rounded-2xl shadow-2xl border p-6 relative transition-all 
        ${darkMode
          ? "bg-gray-900 border-gray-700 text-gray-100"
          : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            darkMode
              ? "hover:bg-gray-800 text-gray-400"
              : "hover:bg-gray-100 text-gray-500"
          }`}
        >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Create New Board
        </h2>

        <input
          type="text"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder="Enter board name..."
          className={`w-full px-4 py-2 rounded-lg mb-5 outline-none border transition-all
          ${darkMode
            ? "bg-gray-800 border-gray-700 focus:border-indigo-500 text-gray-100 placeholder-gray-500"
            : "bg-gray-50 border-gray-300 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
          }`}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg font-semibold text-white shadow bg-[#4F46E5] hover:bg-[#6366F1] transition-all duration-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
