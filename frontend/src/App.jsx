// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./components/ResetPassword";
import MainApp from "./MainApp";
import PopupModels from './components/popupmodels/PopupModels';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark") === "true");

  // ✅ Simple popup state without infoPopup
  const [popupState, setPopupState] = useState({
    deletePopup: { 
      isOpen: false, 
      title: '', 
      type: 'column',
      onConfirm: null,
      data: null 
    },
    successPopup: { 
      isOpen: false, 
      message: '' 
    }
  });

  const handleLogin = (userData, tokenValue) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
    setUser(userData);
    setToken(tokenValue);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  const showDeletePopup = (title, type = 'column', onConfirm, data = null) => {
    setPopupState(prev => ({
      ...prev,
      deletePopup: { 
        isOpen: true, 
        title, 
        type,
        onConfirm,
        data 
      }
    }));
  };

  const closeDeletePopup = () => {
    setPopupState(prev => ({
      ...prev,
      deletePopup: { ...prev.deletePopup, isOpen: false }
    }));
  };

  const showSuccessPopup = (message) => {
    setPopupState(prev => ({
      ...prev,
      successPopup: { isOpen: true, message }
    }));
  };

  const closeSuccessPopup = () => {
    setPopupState(prev => ({
      ...prev,
      successPopup: { ...prev.successPopup, isOpen: false }
    }));
  };

  const popupContext = {
    showDeletePopup,
    showSuccessPopup,
    closeDeletePopup,
    closeSuccessPopup
  };

  return (
    <Router>
      {/* ✅ PopupModels without infoPopup prop */}
      <PopupModels
        deletePopup={popupState.deletePopup}
        successPopup={popupState.successPopup}
        onCloseDelete={closeDeletePopup}
        onConfirmDelete={() => {
          if (popupState.deletePopup.onConfirm) {
            popupState.deletePopup.onConfirm(popupState.deletePopup.data);
          }
        }}
        onCloseSuccess={closeSuccessPopup}
        darkMode={darkMode}
      />

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <MainApp 
                initialUser={user} 
                token={token} 
                onLogout={handleLogout}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                popupContext={popupContext}
              />
            ) : (
              <AuthPage darkMode={darkMode} onLogin={handleLogin} />
            )
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}