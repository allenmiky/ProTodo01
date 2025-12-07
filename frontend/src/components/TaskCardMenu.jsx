import React, { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiArchive, FiStar, FiTrash2, FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Portal } from "react-portal";
import useOutsideClick from "../hooks/useOutsideClick"; // ✅ make sure path is correct

const TaskCardMenu = ({ taskId, pinned, onArchive, onPin, onDelete, onEdit, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  /* ✅ Close menu when clicking outside */
  useOutsideClick(menuRef, () => setIsOpen(false));

  /* ---------- handlers ---------- */
  const handleArchive = () => {
    toast.success("Task archived!");
    onArchive?.(taskId);
    setIsOpen(false);
  };

  const handlePin = () => {
    onPin?.(taskId);
    setIsOpen(false);
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Confirm delete?</span>
          <button
            onClick={() => {
              onDelete?.(taskId);
              toast.dismiss(t.id);
              setIsOpen(false);
            }}
            className="px-2 py-1 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2 py-1 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400"
          >
            No
          </button>
        </div>
      ),
      { duration: 4000, position: "top-center" }
    );
  };

  const handleEdit = () => {
    onEdit?.();
    setIsOpen(false);
  };

  const getMenuPosition = () => {
    if (!btnRef.current) return { top: 0, left: 0 };
    const rect = btnRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 144, // 144px = w-36 (9rem)
    };
  };

  return (
    <div className="relative">
      {/* Three-dots trigger */}
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((o) => !o);
        }}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          darkMode
            ? "hover:bg-gray-600 text-gray-400 hover:text-white"
            : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
        }`}
        title="Task options"
      >
        <FiMoreVertical size={16} />
      </button>

      {/* Portalled dropdown */}
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className={`fixed z-[999] w-36 rounded-xl border shadow-lg p-2 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              style={getMenuPosition()}
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <FiEdit size={14} /> Edit
                </button>
              )}

              {onPin && (
                <button
                  onClick={handlePin}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    darkMode
                      ? pinned
                        ? "text-yellow-400 hover:bg-gray-700"
                        : "text-gray-200 hover:bg-gray-700"
                      : pinned
                        ? "text-yellow-500 hover:bg-gray-100"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FiStar
                    size={14}
                    className={pinned ? "fill-yellow-400" : ""}
                  />{" "}
                  {pinned ? "Unpin" : "Pin"}
                </button>
              )}

              {onArchive && (
                <button
                  onClick={handleArchive}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <FiArchive size={14} /> Archive
                </button>
              )}

              {onDelete && (
                <button
                  onClick={handleDelete}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    darkMode
                      ? "hover:bg-rose-500/20 text-rose-400"
                      : "hover:bg-rose-50 text-rose-600"
                  }`}
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              )}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskCardMenu;
