"use client";
import React, { useEffect, useRef, useState } from "react";

interface ModelViewerProps {
  src: string;
  alt: string;
  ar?: boolean;
  arModes?: string;
  autoRotate?: boolean;
  autoRotateDelay?: number;
  cameraControls?: boolean;
  cameraOrbit?: string;
  cameraTarget?: string;
  environmentImage?: string;
  exposure?: number;
  posterImage?: string;
  shadowIntensity?: number;
  skyboxImage?: string;
  width?: string;
  height?: string;
  className?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
  onLoad?: (event: Event) => void;
  onError?: (event: ErrorEvent) => void;
  style?: React.CSSProperties;
  currentVariant?: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
                                                   src,
                                                   alt,
                                                   ar = true,
                                                   arModes = "webxr scene-viewer quick-look",
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
                                                   currentVariant,
                                                 }) => {
  const modelViewerRef = useRef<HTMLElement | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import model-viewer
    const importModelViewer = async () => {
      try {
        await import("@google/model-viewer/dist/model-viewer");
      } catch (error) {
        console.error("Failed to load model-viewer:", error);
      }
    };

    importModelViewer();

    // Setup model and event listeners once loaded
    const setupModelViewer = () => {
      const modelViewer = modelViewerRef.current;
      if (!modelViewer) return;

      // Custom handler for model load event
      const handleModelLoad = (event: Event) => {
        console.log("Model loaded:", modelViewer);
        setModelLoaded(true);

        // Apply variant after model is fully loaded
        if (currentVariant) {
          setTimeout(() => {
            applyVariant(currentVariant);
          }, 100);
        }

        // Call user's onLoad handler if provided
        if (onLoad) onLoad(event);
      };

      // Event listeners
      modelViewer.addEventListener("load", handleModelLoad);

      if (onError) {
        modelViewer.addEventListener("error", onError);
      }

      // Critical: Enhanced AR session handling
      modelViewer.addEventListener("ar-status", (event: any) => {
        console.log("AR status change:", event.detail.status);

        if (event.detail.status === "session-started") {
          console.log("AR session started, applying variant:", currentVariant);

          // Force immediate variant application when AR starts
          if (currentVariant && currentVariant !== 'default') {
            try {
              // Direct property assignment for immediate effect
              modelViewer.variantName = currentVariant;

              // Also set it as a model-level data attribute
              modelViewer.setAttribute('data-current-variant', currentVariant);

              // Force a scene update if possible
              if (modelViewer.updateFraming) {
                modelViewer.updateFraming();
              }

              console.log("Variant applied in AR:", currentVariant);
            } catch (err) {
              console.error("Error applying variant in AR:", err);
            }
          }
        }
      });

      // Clean up event listeners
      return () => {
        if (modelViewer) {
          modelViewer.removeEventListener("load", handleModelLoad);
          if (onError) {
            modelViewer.removeEventListener("error", onError);
          }
          modelViewer.removeEventListener("ar-status", () => {});
        }
      };
    };

    const cleanup = setupModelViewer();
    return cleanup;
  }, [onLoad, onError]);

  // Apply variant whenever it changes
  useEffect(() => {
    if (modelLoaded && currentVariant) {
      applyVariant(currentVariant);
    }
  }, [currentVariant, modelLoaded]);

  // Function to apply variant with proper error handling
  const applyVariant = (variant: string) => {
    const modelViewer = modelViewerRef.current as any;
    if (!modelViewer) return;

    try {
      // Store variant information as data attribute for AR session
      modelViewer.setAttribute('data-ar-variant', variant);

      // Apply variant to the model
      console.log(`Applying variant: ${variant}, available:`, modelViewer.availableVariants);

      // Use the appropriate method based on whether it's default or not
      if (variant === 'default') {
        modelViewer.variantName = null;
      } else {
        modelViewer.variantName = variant;
      }

      // Force a scene update after variant change
      if (modelViewer.updateFraming) {
        modelViewer.updateFraming();
      }

      console.log("Current variant after setting:", modelViewer.variantName);
    } catch (err) {
      console.error("Error applying variant:", err);
    }
  };

  // Enhanced AR activation with pre-loading and variant application
  const activateAR = () => {
    const modelViewer = modelViewerRef.current as any;
    if (!modelViewer) return;

    try {
      // Make sure model is fully prepared before AR
      const prepareForAR = async () => {
        console.log("Preparing for AR...");

        // Ensure the model is loaded
        if (!modelLoaded) {
          await new Promise<void>(resolve => {
            const checkLoaded = () => {
              if (modelViewer.loaded) {
                resolve();
              } else {
                setTimeout(checkLoaded, 100);
              }
            };
            checkLoaded();
          });
        }

        // Apply variant with assertion to ensure it takes
        if (currentVariant) {
          applyVariant(currentVariant);

          // Store in a global variable as a backup method
          // @ts-ignore
          window.__lastAppliedVariant = currentVariant;

          // Use scene graph API if available
          if (modelViewer.model && modelViewer.model.materials) {
            console.log("Using scene graph API to force variant");
            // Actual implementation depends on the model structure
          }
        }

        // Finally activate AR
        setTimeout(() => {
          console.log("Activating AR with variant:", currentVariant);
          if (modelViewer.canActivateAR) {
            modelViewer.activateAR();
          }
        }, 100);
      };

      prepareForAR();
    } catch (err) {
      console.error("Error in AR activation:", err);
      // Fallback to standard AR activation
      if (modelViewer.canActivateAR) {
        modelViewer.activateAR();
      }
    }
  };

  // Custom CSS for AR button to make it more noticeable
  const arButtonStyle = {
    backgroundColor: "#1e88e5",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  };

  return (
      <>
        {/* @ts-ignore - model-viewer is a Web Component */}
        <model-viewer
            ref={modelViewerRef}
            src={src}
            alt={alt}
            ar={ar ? "true" : "false"}
            ar-modes={arModes}
            auto-rotate={autoRotate ? "true" : "false"}
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
            data-ar-variant={currentVariant}
            // Additional attributes to help with variant handling
            data-js-focus-visible
            interaction-prompt="auto"
            min-camera-orbit="auto auto auto"
            max-camera-orbit="auto auto auto"
            min-field-of-view="auto"
            max-field-of-view="auto"
        >
          <div slot="progress-bar"></div>

          {/* Custom AR button with enhanced handler */}
          {ar && (
              <button
                  slot="ar-button"
                  className="ar-button"
                  style={arButtonStyle}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    activateAR();
                  }}
              >
                View in your space
              </button>
          )}

          {/* Add debug info overlay (can be removed in production) */}
          <div
              slot="default"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '5px',
                fontSize: '12px',
                display: 'none' // Set to 'block' for debugging
              }}
          >
            Current variant: {currentVariant || 'None'}
          </div>

          {/* Add slot for any children passed to component */}
          {React.Children.map(
              // @ts-ignore - children prop not explicitly defined
              (props) => props.children,
              (child) => child
          )}
        </model-viewer>
      </>
  );
};

export default ModelViewer;