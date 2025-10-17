import React, { useState } from "react";
import { FiPlus, FiMoreVertical, FiArchive, FiTrash2 } from "react-icons/fi";
import AddBoardModal from "./AddBoardModal";

export default function Sidebar({
  boards = [],
  activeBoardId,
  setActiveBoardId,
  addBoard,
  onArchive,
  onDelete,
  darkMode,
}) {
  const [menuOpen, setMenuOpen] = useState(null);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);

  const handleAddBoard = async (name) => {
    await addBoard(name);
    setShowAddBoardModal(false);
  };

  return (
    <>
      <aside
        className={`${
          darkMode
            ? "bg-gray-900 text-gray-100 border-gray-700"
            : "bg-white text-gray-800 border-slate-200"
        } w-64 border-r flex flex-col transition-colors duration-300`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            darkMode ? "border-gray-700" : "border-slate-200"
          }`}
        >
          <h2 className="font-bold text-lg">Boards</h2>
          <button
  onClick={() => addBoard()}  // ✅ just trigger the modal
  className={`p-1.5 rounded transition-colors duration-200 ${
    darkMode
      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
      : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
  }`}
  title="Add new board"
>
  <FiPlus />
</button>

        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {boards.map((board) => (
            <div
              key={board._id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                board._id === activeBoardId
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "hover:bg-gray-800"
                  : "hover:bg-slate-200"
              }`}
            >
              <span
                onClick={() => setActiveBoardId(board._id)}
                className="truncate flex-1"
              >
                {board.name}
              </span>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === board._id ? null : board._id);
                  }}
                  className={`p-1 rounded transition-colors duration-200 ${
                    darkMode
                      ? "bg-gray-700 text-[#fff]"
                      : "bg-slate-200 text-gray-600"
                  }`}
                >
                  <FiMoreVertical />
                </button>

                {menuOpen === board._id && (
                  <div
                    className={`absolute right-0 mt-1 w-36 rounded-lg shadow-lg border z-10 overflow-hidden transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => {
                        onArchive && onArchive(board);
                        setMenuOpen(null);
                      }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                        darkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-slate-100 text-gray-700"
                      }`}
                    >
                      <FiArchive /> Archive
                    </button>

                    <button
                      onClick={() => {
                        onDelete && onDelete(board);
                        setMenuOpen(null);
                      }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                        darkMode
                          ? "text-rose-400 hover:bg-gray-700"
                          : "text-rose-500 hover:bg-slate-100"
                      }`}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 🔹 Add Board Modal */}
      <AddBoardModal
        isOpen={showAddBoardModal}
        onClose={() => setShowAddBoardModal(false)}
        onConfirm={handleAddBoard}
        darkMode={darkMode}
      />
    </>
  );
}
