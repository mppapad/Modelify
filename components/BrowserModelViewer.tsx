"use client";

import React from "react";
import MacBrowser from "./MacBrowser";
import ModelViewer from "./ModelViewer";

interface BrowserModelViewerProps {
  modelSrc: string;
  modelAlt: string;
  title?: string;
  url?: string;
  height?: string;
  width?: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  environmentImage?: string;
  shadowIntensity?: number;
}

const BrowserModelViewer: React.FC<BrowserModelViewerProps> = ({
  modelSrc,
  modelAlt,
  title = "My 3D Portfolio",
  url = "https://my-portfolio.com/3d-model",
  height = "500px",
  width = "100%",
  className = "",
  autoRotate = true,
  cameraControls = true,
  environmentImage = "neutral",
  shadowIntensity = 1,
}) => {
  return (
    <MacBrowser
      title={title}
      url={url}
      height={height}
      width={width}
      className={className}
    >
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
    </MacBrowser>
  );
};

export default BrowserModelViewer;
