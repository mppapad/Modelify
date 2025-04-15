"use client";

import React from "react";
import ModelViewer from "./ModelViewer";

interface MacModelViewerProps {
  modelSrc: string;
  modelAlt: string;
  height?: string;
  width?: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  environmentImage?: string;
  shadowIntensity?: number;
}

const MacModelViewer: React.FC<MacModelViewerProps> = ({
  modelSrc,
  modelAlt,
  height = "100%",
  width = "100%",
  className = "",
  autoRotate = true,
  cameraControls = true,
  environmentImage = "neutral",
  shadowIntensity = 1,
}) => {
  return (
      <ModelViewer
        src={modelSrc}
        alt={modelAlt}
        autoRotate={autoRotate}
        cameraControls={cameraControls}
        environmentImage={environmentImage}
        shadowIntensity={shadowIntensity}
        height="100%"
        width="100%"
      />
  );
};

export default MacModelViewer;
