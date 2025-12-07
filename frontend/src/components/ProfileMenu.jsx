import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit2, FiLogOut, FiArchive } from "react-icons/fi";
import { API } from "../config/api";
import useOutsideClick from "../hooks/useOutsideClick";

/* -------------------------------------------------
   ✅ Custom Alert (auto close + click outside close)
-------------------------------------------------- */
function CustomAlert({ message, onClose }) {
  const alertRef = useRef();
  useOutsideClick(alertRef, onClose);

  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div
      ref={alertRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg z-50 text-sm"
    >
      {message}
    </div>
  );
}

/* -------------------------------------------------
   ✅ Edit Profile Modal (close on outside click)
-------------------------------------------------- */
function EditProfileModal({ user, onSave, onClose, darkMode }) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const modalRef = useRef();

  useOutsideClick(modalRef, onClose);

  useEffect(() => {
    setName(user.name || "");
    setAvatar(user.avatar || "");
  }, [user]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => setAvatar(ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return alert("Name cannot be empty");
    onSave({ ...user, name, avatar });
    onClose(); // ✅ close modal after save
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl ring-1 ${
          darkMode
            ? "bg-gray-800 text-gray-200 ring-gray-700"
            : "bg-white text-gray-700 ring-gray-200"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

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

/* -------------------------------------------------
   ✅ Profile Menu (dropdown close on outside click)
-------------------------------------------------- */
export default function ProfileMenu({
  darkMode = false,
  onLogout,
  user,
  setUser,
  archivedCount = 0,
  onShowArchive = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef();

  useOutsideClick(menuRef, () => setOpen(false));

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleSaveProfile = async (updatedUser) => {
    setIsLoading(true);
    try {
      const { data } = await API.put("/auth/profile", updatedUser);
      setLocalUser(data.user);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setShowEdit(false);
      setAlertMessage("Profile updated successfully!");
    } catch (err) {
      setAlertMessage(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItem = (icon, label, onClick, danger, extraClasses = "") => (
    <button
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition ${extraClasses} ${
        danger
          ? "text-red-600"
          : darkMode
          ? "hover:bg-gray-700"
          : "hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-2 py-1 transition ${
            darkMode
              ? "hover:bg-gray-700 text-gray-200"
              : "hover:bg-gray-100 text-gray-700"
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
          <span className="text-sm truncate max-w-[8rem]">
            {localUser?.name?.split(" ")[0]}
          </span>
        </button>

        {/* dropdown */}
        {open && (
          <div
            className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg ring-1 ${
              darkMode
                ? "bg-gray-800 text-gray-200 ring-gray-700"
                : "bg-white text-gray-700 ring-gray-200"
            } z-30`}
          >
            <div className="p-2">
              <p className="px-3 py-2 text-sm font-semibold truncate border-b border-gray-200 dark:border-gray-700">
                {localUser?.name}
              </p>

              {/* ✅ Archive only visible on mobile */}
              {menuItem(
                <FiArchive className="shrink-0" />,
                `Archive (${archivedCount})`,
                onShowArchive,
                false,
                "md:hidden"
              )}

              {menuItem(
                <FiEdit2 className="shrink-0" />,
                "Edit Profile",
                () => setShowEdit(true)
              )}
              {menuItem(
                <FiLogOut className="shrink-0" />,
                "Logout",
                onLogout,
                true
              )}
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <EditProfileModal
          user={localUser}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
          darkMode={darkMode}
        />
      )}

      <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
