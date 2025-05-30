// @ts-nocheck
// the file is not needed anymore, but it could be rebuilt for preview before the main component.
"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface ModelViewerProps {
  modelId: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  loading?: "auto" | "lazy" | "eager";
  poster?: string;
}

interface SecureUrlResponse {
  success: boolean;
  url: string;
  expiresAt: string;
  model: {
    id: string;
    name: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
}

export default function ModelViewer({
  modelId,
  className = "",
  autoRotate = true,
  cameraControls = true,
  loading = "lazy",
  poster,
}: ModelViewerProps) {
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [modelData, setModelData] = useState<SecureUrlResponse["model"] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlExpired, setUrlExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSecureUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUrlExpired(false);

      const response = await fetch(`/api/models/${modelId}/url`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get secure URL");
      }

      const data: SecureUrlResponse = await response.json();

      setSecureUrl(data.url);
      setModelData(data.model);

      // Set up expiration timer
      const expiresAt = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const timeToExpiry = expiresAt - now;

      if (timeToExpiry > 0) {
        // Refresh URL 5 minutes before expiry
        const refreshTime = Math.max(timeToExpiry - 5 * 60 * 1000, 30000);

        intervalRef.current = setTimeout(() => {
          setUrlExpired(true);
          fetchSecureUrl();
        }, refreshTime);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecureUrl();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [modelId]);

  const handleRetry = () => {
    fetchSecureUrl();
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <div className="flex flex-col items-center space-y-2 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="flex flex-col items-center space-y-3 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Failed to load model
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!secureUrl || !modelData) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <div className="flex flex-col items-center space-y-2 p-8">
          <AlertCircle className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">Model not available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
    >
      {urlExpired && (
        <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs text-yellow-800 z-10">
          Refreshing...
        </div>
      )}

      <model-viewer
        src={secureUrl}
        alt={modelData.name}
        auto-rotate={autoRotate}
        camera-controls={cameraControls}
        loading={loading}
        poster={poster}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
        onError={() => setError("Failed to load 3D model")}
      />

      {/* Model info overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 max-w-xs">
        <div className="truncate">{modelData.name}</div>
        <div className="text-gray-300">
          {(modelData.fileSize / (1024 * 1024)).toFixed(1)} MB •{" "}
          {modelData.mimeType.includes("usdz") ? "USDZ" : "GLB"}
        </div>
      </div>
    </div>
  );
}

// Hook to load model-viewer script
export function useModelViewer() {
  useEffect(() => {
    // Check if model-viewer is already loaded
    if (window.customElements && window.customElements.get("model-viewer")) {
      return;
    }

    // Load model-viewer script
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.async = true;

    document.head.appendChild(script);

    return () => {
      // Cleanup is handled by the browser
    };
  }, []);
}

// Example usage component
export function ModelViewerExample({ modelId }: { modelId: string }) {
  useModelViewer(); // Load the model-viewer script

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">3D Model Viewer</h2>
        </div>

        <ModelViewer
          modelId={modelId}
          className="h-96"
          autoRotate={true}
          cameraControls={true}
          loading="lazy"
        />

        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Interactive 3D Model</span>
            <div className="flex items-center space-x-1">
              <ExternalLink className="h-4 w-4" />
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
