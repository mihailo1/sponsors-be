import React from "react";

interface ToggleButtonProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

function ToggleButton({ darkMode, setDarkMode }: ToggleButtonProps) {
  const handleClick = () => {
    // Wrap the state update in startViewTransition
    if (!document.startViewTransition) {
      setDarkMode(!darkMode);
      return;
    }
    document.startViewTransition(() => {
      setDarkMode(!darkMode);
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`w-14 h-8 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        darkMode ? "justify-end" : "justify-start"
      }`}
    >
      <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300">
      </div>
    </div>
  );
}

export default ToggleButton;
