// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";

interface ModelViewerProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: "auto" | "lazy" | "eager";
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "environment-image"?: string;
  "shadow-intensity"?: string;
  "camera-orbit"?: string;
  poster?: string;
  [key: string]: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  src,
  alt = "3D Model",
  className = "",
  loading = "lazy",
  ...props
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Dynamically import model-viewer script
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";

    if (!document.querySelector('script[src*="model-viewer"]')) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <model-viewer
      ref={modelViewerRef}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      {...props}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        ...props.style,
      }}
    />
  );
};

export default ModelViewer;
