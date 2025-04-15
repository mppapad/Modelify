"use client";

import React, { ReactNode } from "react";

interface MacWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
  height?: string;
  width?: string;
  showControls?: boolean;
}

const MacWindow: React.FC<MacWindowProps> = ({
  children,
  title = "Browser Window",
  className = "",
  height = "auto",
  width = "100%",
  showControls = true,
}) => {
  return (
    <div
      className={`flex flex-col rounded-lg shadow-lg overflow-hidden border border-gray-200 ${className}`}
      style={{ height, width }}
    >
      {/* Window Header/Toolbar */}
      <div className="bg-gray-100 px-4 py-2 flex items-center border-b border-gray-200">
        {/* Window Controls */}
        {showControls && (
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        )}

        {/* Window Title */}
        <div className="text-sm text-gray-600 flex-1 text-center">{title}</div>

        {/* Spacer for visual balance */}
        {showControls && <div className="w-14"></div>}
      </div>

      {/* Window Content */}
      <div className="flex-1 bg-white overflow-hidden">{children}</div>
    </div>
  );
};

export default MacWindow;
