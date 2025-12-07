import React, { useRef } from "react";
import { FiArchive, FiTrash2 } from "react-icons/fi";
import useOutsideClick from "../hooks/useOutsideClick";

export default function SidebarMenu({ board, darkMode, onArchive, onDelete, onClose }) {
  const menuRef = useRef(null);
  useOutsideClick(menuRef, onClose);

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 mt-1 w-36 rounded-lg shadow-lg border z-50 overflow-hidden
        animate-fadeIn transition-all duration-300 ease-out
        ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}
      `}
    >
      <button
        onClick={() => {
          onArchive && onArchive(board);
          onClose();
        }}
        className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-slate-100 text-gray-700"
        }`}
      >
        <FiArchive /> Archive
      </button>

      <button
        onClick={() => {
          onDelete && onDelete(board);
          onClose();
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
  );
}
