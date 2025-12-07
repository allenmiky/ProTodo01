import React, { useState } from "react";
import { FiPlus, FiArchive, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskBar({ onAddTask, onShowCardArchive, darkMode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 💻 Desktop / Tablet View */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className={`hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-4 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
          darkMode
            ? "bg-gray-800/70 border-gray-700 text-white"
            : "bg-white/70 border-gray-200 text-gray-800"
        }`}
      >
        {/* 🗂️ Card Archive */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onShowCardArchive}
          title="Card Archive"
          className={`p-3 rounded-full transition-all duration-300 shadow-md ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-sky-400"
              : "bg-gray-100 hover:bg-gray-200 text-sky-600"
          }`}
        >
          <FiArchive size={22} />
        </motion.button>

        {/* ➕ Add Task */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddTask}
          title="Add Task"
          className="p-3 rounded-full text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
        >
          <FiPlus size={24} />
        </motion.button>
      </motion.div>

      {/* 📱 Mobile View (Expandable FAB) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 140, damping: 10 }}
                onClick={onShowCardArchive}
                className={`p-3 rounded-full shadow-md ${
                  darkMode
                    ? "bg-gray-800 text-sky-400 hover:bg-gray-700"
                    : "bg-white text-sky-600 hover:bg-gray-100"
                }`}
              >
                <FiArchive size={22} />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.8 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 140, damping: 10 }}
                onClick={onAddTask}
                className="p-3 rounded-full shadow-md text-white bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
              >
                <FiPlus size={22} />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* 🌀 FAB Toggle */}
        <motion.button
          whileTap={{ scale: 0.9, rotate: 90 }}
          onClick={() => setOpen(!open)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            open ? "rotate-45" : "rotate-0"
          } ${
            darkMode
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "bg-gradient-to-r from-indigo-600 to-sky-500 text-white hover:from-indigo-500 hover:to-sky-400"
          }`}
        >
          {open ? <FiX size={24} /> : <FiPlus size={24} />}
        </motion.button>
      </div>
    </>
  );
}
