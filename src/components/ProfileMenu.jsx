import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit2, FiLogOut } from "react-icons/fi";
import { API } from "../config/api"; // ✅ use shared axios instance

/* ==================== CUSTOM ALERT COMPONENT ==================== */
function CustomAlert({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close alert after 3 seconds
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-4 bg-indigo-600 text-white rounded-lg shadow-lg z-50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span>{message}</span>
      </div>
    </div>
  );
}

/* ==================== EDIT PROFILE MODAL ==================== */
function EditProfileModal({ user, onSave, onClose, darkMode }) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");

  useEffect(() => {
    setName(user.name || "");
    setAvatar(user.avatar || "");
  }, [user]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return alert("Name cannot be empty");
    onSave({ ...user, name, avatar });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        className={`rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl ring-1 ${
          darkMode
            ? "bg-gray-800 text-gray-200 ring-gray-700"
            : "bg-white text-gray-700 ring-gray-200"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

        {/* Name Field */}
        <label className="block mb-4">
          <span className="text-sm">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          />
        </label>

        {/* Avatar Upload */}
        <div className="mb-4">
          <span className="text-sm">Avatar</span>
          <div className="flex items-center gap-4 mt-2">
            {avatar ? (
              <img
                src={avatar}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle
                className={`w-16 h-16 p-4 rounded-full ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-400"
                }`}
              />
            )}
            <label className="cursor-pointer px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition">
              <input type="file" accept="image/*" hidden onChange={handleFile} />
              Change
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-lg transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== PROFILE MENU ==================== */
export default function ProfileMenu({ darkMode = false, onLogout, user, setUser }) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [alertMessage, setAlertMessage] = useState(""); // State for custom alert message
  const [isLoading, setIsLoading] = useState(false); // Loading state

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleSaveProfile = async (updatedUser) => {
    setIsLoading(true); // Show loading state
    try {
      // ✅ Use shared axios instance (auto-adds token)
      const { data } = await API.put("/auth/profile", updatedUser);

      // ✅ Update UI instantly + localStorage
      setLocalUser(data.user);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      setShowEdit(false);
      setAlertMessage("Profile updated successfully!"); // Custom success message
      setIsLoading(false); // Hide loading state
    } catch (err) {
      setAlertMessage(err.response?.data?.message || err.message); // Custom error message
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <>
      <div className="relative">
        {/* Avatar trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-2 py-1 transition ${
            darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {localUser?.avatar ? (
            <img
              src={localUser.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-8 h-8 text-indigo-500" />
          )}
          <span className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            {localUser?.name?.split(" ")[0]}
          </span>
        </button>

        {/* Dropdown menu */}
        {open && (
          <div
            className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg ring-1 ${
              darkMode ? "bg-gray-800 text-gray-200 ring-gray-700" : "bg-white text-gray-700 ring-gray-200"
            }`}
          >
            <div className="p-2">
              <p className="px-3 py-2 text-sm font-semibold truncate">{localUser?.name}</p>

              <button
                onClick={() => {
                  setShowEdit(true);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <FiEdit2 /> Edit Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition text-red-600 ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal
          user={localUser}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
          darkMode={darkMode}
        />
      )}

      {/* Custom Alert */}
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />

      {/* Loading Spinner (optional) */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}
