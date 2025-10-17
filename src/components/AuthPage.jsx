// src/components/AuthPage.jsx
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import API_BASE from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

function ForgotPasswordModal({ onClose, darkMode }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return toast.error("Enter your email!");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || "Check your inbox!");
      toast.success(data.message || "Check your inbox!");
    } catch {
      setMessage("Something went wrong.");
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className={`rounded-xl p-6 w-full max-w-sm shadow-lg ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full mb-4 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
            }`}
          />
          {message && (
            <p className="text-sm mb-3 text-center text-indigo-500">{message}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Link"}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg ${
                darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


export default function AuthPage({ darkMode, onLogin }) {
  const [activeForm, setActiveForm] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !pass || (activeForm === "signup" && !name)) {
      return toast.error("Please fill all fields");
    }

    if (pass.length < 5) {
      return toast.error("Password must be at least 5 characters");
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/auth/${activeForm}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Auth failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`${activeForm === "login" ? "Logged in" : "Account created"} successfully!`);
      onLogin(data.user, data.token);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const letters = ["P", "r", "o", "-", "T", "o", "d", "o"];

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
      }`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Panel - Desktop only */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`hidden md:flex flex-col justify-center items-start px-16 w-1/2 relative overflow-hidden ${
          darkMode ? "bg-indigo-700" : "bg-indigo-600"
        } text-white`}
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500 opacity-20 blur-3xl rounded-full"
        />
        <div className="flex text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg gap-1">
          {letters.map((char, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -20] }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.15,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        <TypeAnimation
          sequence={[
            "Manage your daily tasks smarter, faster, and beautifully.",
            2000,
            "Stay productive. Stay organized. Stay inspired.",
            2000,
          ]}
          wrapper="p"
          speed={50}
          repeat={Infinity}
          className="text-lg opacity-90 leading-relaxed max-w-md"
        />
        <div className="mt-10 flex gap-4">
          {["login", "signup"].map((type) => (
            <motion.button
              key={type}
              onClick={() => setActiveForm(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 rounded-xl font-semibold transition ${
                activeForm === type
                  ? "bg-white text-indigo-600"
                  : "bg-white/30 text-white hover:bg-white/50"
              }`}
            >
              {type === "login" ? "Login" : "Sign Up"}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeForm}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md rounded-2xl p-8 shadow-xl border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">
              {activeForm === "login" ? "Login" : "Sign Up"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeForm === "signup" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-xl text-gray-500 hover:text-indigo-500"
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {activeForm === "login" && (
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-60"
              >
                {loading ? "Processing..." : activeForm === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            {/* Mobile buttons to switch form */}
            <div className="mt-4 flex justify-center gap-4 md:hidden">
              {["login", "signup"].map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setActiveForm(type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    activeForm === type
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type === "login" ? "Login" : "Sign Up"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {showForgot && (
        <ForgotPasswordModal
          onClose={() => setShowForgot(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
