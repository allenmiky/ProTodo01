import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, darkMode }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`w-[320px] p-6 rounded-2xl shadow-2xl ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
                            }`}
                    >
                        <h3 className="text-lg font-bold mb-3 text-center">
                            Delete Board?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                            Are you sure you want to delete <b>{title}</b>? This action cannot be undone.
                        </p>
                        <div className="flex justify-between">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
