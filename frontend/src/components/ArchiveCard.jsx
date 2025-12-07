import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ArchiveCard = ({ archivedCards = [], onClose, darkMode }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <h2 className="text-xl font-bold mb-4">Archived Cards</h2>

          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>

          {archivedCards.length === 0 ? (
            <p className="text-sm">No archived cards</p>
          ) : (
            archivedCards.map((card) => (
              <div key={card._id} className="mb-2 p-2 border rounded">
                <h3 className="font-semibold">{card.title}</h3>
                {card.description && <p className="text-sm">{card.description}</p>}
              </div>
            ))
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArchiveCard;
