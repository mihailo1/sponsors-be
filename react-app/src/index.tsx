import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./output.css";
import Home from "./pages/Home";
import API from "./pages/API";
import Settings from "./pages/Settings";
import ToggleButton from "./components/ToggleButton";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";
import { ToastContainer } from "react-toastify";

interface ToggleButtonProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const location = useLocation();

  console.log("location:", location);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-blue-600 dark:bg-gray-800 text-white dark:text-dark-text p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <ToggleButton darkMode={darkMode} setDarkMode={setDarkMode} />
      </header>
      <div className="flex flex-1 bg-white-bg dark:bg-dark-bg">
        <Navbar />
        <main
          className={`flex-1 p-8 bg-white dark:bg-gray-800 rounded-lg m-4 ${
            location.pathname === "/api" ? "overflow-x-scroll" : ""
          }`}
        >
          <Routes>
            <Route path="/api" element={<API />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <Router
    basename="/admin"
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <ThemeProvider>
      <ToastContainer />
      <App />
    </ThemeProvider>
  </Router>,
);
