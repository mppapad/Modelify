"use client";
import React, { useEffect, useRef } from "react";
import { ModelViewerProps } from "./types";

const ModelViewer: React.FC<ModelViewerProps> = ({
  src,
  alt,
  ar = true,
  arModes = "webxr  quick-look",
  autoRotate = false,
  autoRotateDelay = 2000,
  cameraControls = true,
  cameraOrbit,
  cameraTarget,
  environmentImage = "neutral",
  exposure = 1,
  posterImage,
  shadowIntensity = 1,
  skyboxImage,
  width = "100%",
  height = "400px",
  className = "",
  loading = "auto",
  reveal = "auto",
  onLoad,
  onError,
  style = {},
                                                 }) => {
  const modelViewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Dynamically import model-viewer
    const importModelViewer = async () => {
      try {
        await import("@google/model-viewer");
      } catch (error) {
        console.error("Failed to load model-viewer:", error);
      }
    };

    importModelViewer();

    // Set up event listeners
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      if (onLoad) {
        modelViewer.addEventListener("load", onLoad);
      }
      if (onError) {
        modelViewer.addEventListener("error", onError);
      }
    }

    // Clean up event listeners
    return () => {
      if (modelViewer) {
        if (onLoad) {
          modelViewer.removeEventListener("load", onLoad);
        }
        if (onError) {
          modelViewer.removeEventListener("error", onError);
        }
      }
    };
  }, [onLoad, onError]);

  return (
    <>
      {/* @ts-ignore - model-viewer is a Web Component */}
      <model-viewer
        ref={modelViewerRef}
        src={src}
        alt={alt}
        ar={ar ? "true" : "false"}
        ar-modes={arModes}
        auto-rotate={autoRotate}
        auto-rotate-delay={autoRotateDelay.toString()}
        camera-controls={cameraControls ? "true" : "false"}
        camera-orbit={cameraOrbit}
        camera-target={cameraTarget}
        environment-image={environmentImage}
        exposure={exposure.toString()}
        poster={posterImage}
        shadow-intensity={shadowIntensity.toString()}
        skybox-image={skyboxImage}
        loading={loading}
        reveal={reveal}
        style={{ width, height, ...style }}
        className={className}
      >
        <div slot="progress-bar"></div>

      </model-viewer>
    </>
  );
};

export default ModelViewer;
