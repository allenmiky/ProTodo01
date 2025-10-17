import React from "react";
import { FiX, FiCornerUpLeft, FiTrash2 } from "react-icons/fi";

export default function ArchiveDrawer({
  boards,
  onRestore,
  onDeleteClick, // 👈 parent se modal open karne wala function
  onClose,
  darkMode,
}) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 animate-fadeIn">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 right-0 w-80 border-l shadow-2xl z-50 flex flex-col animate-slideIn
          ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-slate-200"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b
            ${darkMode ? "border-gray-700" : "border-slate-200"}`}
        >
          <h2
            className={`text-lg font-semibold ${
              darkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Archived Boards
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-slate-100 text-gray-600"
            }`}
          >
            <FiX />
          </button>
        </div>

        {/* Archived Boards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {boards.length === 0 ? (
            <p
              className={`text-center mt-10 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              No archived boards
            </p>
          ) : (
            boards.map((b) => (
              <div
                key={b._id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {b.name}
                </span>

                <div className="flex gap-2">
                  {/* Restore Button */}
                  <button
                    onClick={() => onRestore(b)}
                    title="Restore"
                    className={`p-1.5 rounded-full transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-emerald-400"
                        : "hover:bg-slate-200 text-emerald-600"
                    }`}
                  >
                    <FiCornerUpLeft />
                  </button>

                  {/* Delete Forever Button */}
                  <button
                    onClick={() => onDeleteClick(b)} // ✅ direct parent ka delete modal call karega
                    title="Delete Forever"
                    className={`p-1.5 rounded-full transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-red-500"
                        : "hover:bg-slate-200 text-red-600"
                    }`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
