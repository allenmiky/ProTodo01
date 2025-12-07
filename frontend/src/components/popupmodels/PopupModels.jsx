// src/components/popupmodels/PopupModels.jsx
import React from 'react';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const DeleteConfirmPopup = ({ isOpen, onClose, onConfirm, title, type = "column", darkMode }) => {
  if (!isOpen) return null;

  const getMessage = () => {
    switch (type) {
      case "column":
        return `Are you sure you want to delete "${title}" column? All tasks will be deleted.`;
      default:
        return `Are you sure you want to delete "${title}"?`;
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose(); // ✅ Popup close karein confirm ke baad
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <FiAlertTriangle className="text-red-500 text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {getMessage()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ SuccessPopup HATA DEN - Sirf delete popup rakhein
const PopupModels = ({ 
  deletePopup,
  onCloseDelete,
  onConfirmDelete,
  darkMode 
}) => {
  return (
    <DeleteConfirmPopup
      isOpen={deletePopup?.isOpen || false}
      onClose={onCloseDelete}
      onConfirm={onConfirmDelete}
      title={deletePopup?.title || ''}
      type={deletePopup?.type || 'column'}
      darkMode={darkMode}
    />
  );
};

export default PopupModels;