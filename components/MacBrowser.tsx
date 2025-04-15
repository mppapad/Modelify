"use client";

import React, { ReactNode, useState } from "react";

interface MacBrowserProps {
  children: ReactNode;
  title?: string;
  url?: string;
  className?: string;
  height?: string;
  width?: string;
}

const MacBrowser: React.FC<MacBrowserProps> = ({
  children,
  title = "My 3D Portfolio",
  url = "https://my-portfolio.com/about",
  className = "",
  height = "auto",
  width = "100%",
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div
      className={`flex flex-col rounded-lg shadow-xl overflow-hidden border border-gray-200 ${className} ${
        isFullScreen ? "fixed inset-0 z-50" : ""
      }`}
      style={{
        height: isFullScreen ? "100vh" : height,
        width: isFullScreen ? "100vw" : width,
      }}
    >
      {/* Window Header/Toolbar */}
      <div className="bg-gray-100 px-4 py-2 flex items-center border-b border-gray-200">
        {/* Window Controls */}
        <div className="flex space-x-2 mr-4">
          <button
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            aria-label="Close"
          ></button>
          <button
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            aria-label="Minimize"
          ></button>
          <button
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            aria-label="Fullscreen"
            onClick={toggleFullScreen}
          ></button>
        </div>

        {/* Window Title */}
        <div className="text-xs text-gray-600 hidden sm:block">{title}</div>
      </div>

      {/* Browser Navigation Bar */}
      <div className="bg-gray-50 px-4 py-2 flex items-center border-b border-gray-200 space-x-2">
        {/* Navigation Buttons */}
        <div className="flex space-x-1">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 bg-white rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-600 flex items-center">
          <svg
            className="h-4 w-4 text-gray-400 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="truncate">{url}</span>
        </div>

        {/* Browser Actions */}
        <div className="hidden sm:flex space-x-1">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white overflow-hidden">{children}</div>

      {/* Browser Status Bar */}
      <div className="bg-gray-50 px-4 py-1 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <span>Secure Connection</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>

      {/* Fullscreen Exit Button */}
      {isFullScreen && (
        <button
          className="absolute top-4 right-4 bg-gray-800 text-white rounded-full p-2 shadow-lg"
          onClick={toggleFullScreen}
          aria-label="Exit Fullscreen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MacBrowser;
