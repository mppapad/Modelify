// components/ModelViewer/types.ts
export interface ModelViewerProps {
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
  // Callbacks
  onLoad?: () => void;
  onError?: (error: ErrorEvent) => void;
  // Additional styles
  style?: React.CSSProperties;
}
