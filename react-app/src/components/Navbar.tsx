import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "List" },
  { path: "/api", label: "API" },
  { path: "/settings", label: "Settings" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    if (location.pathname === path) return;

    if (!document.startViewTransition) {
      navigate(path);
    } else {
      document.startViewTransition(() => {
        navigate(path);
      });
    }
  };

  return (
    <nav className="w-64 p-4">
      <ul className="flex flex-col">
        {navItems.map((item, index) => (
          <li className="m-0" key={index}>
            <button
              onClick={() => handleNavigate(item.path)}
              className={`block w-full text-left p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 text-gray-800 dark:text-dark-text ${
                location.pathname === item.path
                  ? "bg-blue-100 dark:bg-gray-700 font-semibold"
                  : ""
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
