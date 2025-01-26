import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function Button({ onClick, children, disabled, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 bg-blue-500 text-white dark:text-dark-text rounded-md min-w-[100px] dark:bg-dark-bg ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-blue-700 dark:hover:bg-gray-600"
      } transition-colors duration-300 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
