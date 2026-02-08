//@ts-nocheck
"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";
import ModelViewer from "@/components/ModelViewer";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Ruler,
  QrCodeIcon as ScanQrCode,
  ScanEye,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelMetadata {
  $id: string;
  name: string;
  description: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  userId: string;
  isPublic?: boolean;
  views?: number;
  createdAt: string;
  updatedAt?: string;
  lastViewedAt?: string;
  tags?: string[];
  category?: string;
}

interface ApiError {
  error: string;
  message?: string;
  requiresAuth?: boolean;
}

export default function ModelViewPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const {
    login,
    isAuthenticated,
    isLoading: authLoading,
  } = useKindeBrowserClient();
  const router = useRouter();

  // Model data and loading states
  const [modelData, setModelData] = useState<ModelMetadata | null>(null);
  const [modelUrl, setModelUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Viewer states
  const [currentUrl, setCurrentUrl] = useState("");
  const [isARSupported, setIsARSupported] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [availableVariants, setAvailableVariants] = useState<string[]>([]);
  const [currentVariant, setCurrentVariant] = useState<string | null>(null);
  const modelViewerRef = useRef<any>(null);
  const [viewRecorded, setViewRecorded] = useState(false);
  const renderSVGRef = useRef<(() => void) | null>(null);

  // Fetch model data and generate URL
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        setLoading(true);
        setError(null);
        setRequiresAuth(false);

        console.log("Fetching model data for fileId:", fileId);

        // First, try to get model metadata with proper error handling
        try {
          const metadataResponse = await fetch(`/api/models/get/${fileId}`);

          if (metadataResponse.status === 404) {
            setError("Model not found");
            return;
          }

          if (metadataResponse.status === 403) {
            const errorData: ApiError = await metadataResponse.json();
            setError(
              errorData.message || "Access denied - this model is private",
            );
            setRequiresAuth(errorData.requiresAuth || true);
            return;
          }

          if (metadataResponse.status === 401) {
            setError("Authentication required to view this model");
            setRequiresAuth(true);
            return;
          }

          if (metadataResponse.ok) {
            const data = await metadataResponse.json();
            setModelData(data.model);
            console.log("Model metadata loaded:", data.model);

            // Check if model is private and user needs to be authenticated
            if (!data.model.isPublic && !isAuthenticated && !authLoading) {
              setError("This model is private and requires authentication");
              setRequiresAuth(true);
              return;
            }
          } else {
            throw new Error(
              `Failed to fetch metadata: ${metadataResponse.status}`,
            );
          }
        } catch (metaError) {
          console.log("Could not fetch model metadata:", metaError);
          // Continue without metadata if it's just a fetch issue
        }

        // Use our secure proxy API - this hides the direct Appwrite URL
        const secureFileUrl = `/api/models/view/${fileId}`;
        console.log("Using secure proxy URL:", secureFileUrl);

        // Test if the proxy endpoint works
        try {
          const testResponse = await fetch(secureFileUrl, { method: "HEAD" });

          if (testResponse.status === 403) {
            setError("Access denied - this model is private");
            setRequiresAuth(true);
            return;
          }

          if (testResponse.status === 401) {
            setError("Authentication required to view this model");
            setRequiresAuth(true);
            return;
          }

          if (!testResponse.ok) {
            throw new Error(`Proxy endpoint failed: ${testResponse.status}`);
          }
          console.log("Proxy endpoint is working");
        } catch (testError) {
          console.error("Proxy test failed:", testError);
          setError("Failed to access 3D model through secure proxy");
          return;
        }

        setModelUrl(secureFileUrl);
        setCurrentUrl(window.location.href);
      } catch (error) {
        console.error("Error loading model:", error);
        setError("Failed to load 3D model");
        toast.error("Failed to load 3D model");
      } finally {
        setLoading(false);
      }
    };

    if (fileId && !authLoading) {
      fetchModelData();
    }
  }, [fileId, isAuthenticated, authLoading]);

  // Check AR support and load variants
  useEffect(() => {
    if (!modelUrl) return;

    const checkARSupport = () => {
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer) {
        setIsARSupported((modelViewer as any).canActivateAR === true);
        modelViewerRef.current = modelViewer;
      }
    };

    const timer = setTimeout(() => {
      checkARSupport();
      loadModelVariants();
    }, 1000);

    return () => clearTimeout(timer);
  }, [modelUrl]);

  // Initialize dimensions when model loads and dimensions are shown
  useEffect(() => {
    if (!modelViewerRef.current || !showDimensions) return;

    const modelViewer = modelViewerRef.current;

    const initializeDimensions = () => {
      if (modelViewer.loaded) {
        setupDimensionHotspots();
      } else {
        modelViewer.addEventListener("load", setupDimensionHotspots, {
          once: true,
        });
      }
    };

    initializeDimensions();

    return () => {
      // Cleanup
      removeDimensionHotspots();
    };
  }, [showDimensions]);

  // Toggle dimensions visibility
  const toggleDimensions = () => {
    const newShowDimensions = !showDimensions;
    setShowDimensions(newShowDimensions);

    if (!newShowDimensions) {
      removeDimensionHotspots();
    }
  };

  // Setup dimension hotspots
  const setupDimensionHotspots = () => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    try {
      // Get model dimensions
      const center = modelViewer.getBoundingBoxCenter();
      const size = modelViewer.getDimensions();
      const x2 = size.x / 2;
      const y2 = size.y / 2;
      const z2 = size.z / 2;

      // Create all hotspot elements
      const hotspots = [
        {
          slot: "hotspot-dot+X-Y+Z",
          position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`,
          normal: "1 0 0",
          type: "dot",
        },
        {
          slot: "hotspot-dim+X-Y",
          position: `${center.x + x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`,
          normal: "1 0 0",
          type: "dim",
          text: `${(size.z * 100).toFixed(0)} cm`,
        },
        {
          slot: "hotspot-dot+X-Y-Z",
          position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`,
          normal: "1 0 0",
          type: "dot",
        },
        {
          slot: "hotspot-dim+X-Z",
          position: `${center.x + x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`,
          normal: "1 0 0",
          type: "dim",
          text: `${(size.y * 100).toFixed(0)} cm`,
        },
        {
          slot: "hotspot-dot+X+Y-Z",
          position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`,
          normal: "0 1 0",
          type: "dot",
        },
        {
          slot: "hotspot-dim+Y-Z",
          position: `${center.x} ${center.y + y2 * 1.1} ${center.z - z2 * 1.1}`,
          normal: "0 1 0",
          type: "dim",
          text: `${(size.x * 100).toFixed(0)} cm`,
        },
        {
          slot: "hotspot-dot-X+Y-Z",
          position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`,
          normal: "0 1 0",
          type: "dot",
        },
        {
          slot: "hotspot-dim-X-Z",
          position: `${center.x - x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`,
          normal: "-1 0 0",
          type: "dim",
          text: `${(size.y * 100).toFixed(0)} cm`,
        },
        {
          slot: "hotspot-dot-X-Y-Z",
          position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`,
          normal: "-1 0 0",
          type: "dot",
        },
        {
          slot: "hotspot-dim-X-Y",
          position: `${center.x - x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`,
          normal: "-1 0 0",
          type: "dim",
          text: `${(size.z * 100).toFixed(0)} cm`,
        },
        {
          slot: "hotspot-dot-X-Y+Z",
          position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`,
          normal: "-1 0 0",
          type: "dot",
        },
      ];

      // Create SVG for dimension lines
      const dimLines = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      dimLines.id = "dimLines";
      dimLines.setAttribute("width", "100%");
      dimLines.setAttribute("height", "100%");
      dimLines.setAttribute("class", "dimensionLineContainer");
      dimLines.style.position = "absolute";
      dimLines.style.top = "0";
      dimLines.style.left = "0";
      dimLines.style.pointerEvents = "none";
      dimLines.style.zIndex = "5";

      // Create 5 dimension lines
      for (let i = 0; i < 5; i++) {
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.setAttribute("class", "dimensionLine");
        dimLines.appendChild(line);
      }

      modelViewer.appendChild(dimLines);

      // Create hotspot elements
      hotspots.forEach((hotspotInfo) => {
        const element = document.createElement("button");
        element.slot = hotspotInfo.slot;
        element.className = hotspotInfo.type;
        element.setAttribute("data-position", hotspotInfo.position);
        element.setAttribute("data-normal", hotspotInfo.normal);

        if (hotspotInfo.type === "dim" && hotspotInfo.text) {
          element.textContent = hotspotInfo.text;
        }

        modelViewer.appendChild(element);
      });

      // Create a map of dimension slot to normal for visibility checking
      const dimensionNormals = {};
      hotspots.forEach((h) => {
        if (h.type === "dim") {
          dimensionNormals[h.slot] = h.normal;
        }
      });

      // Setup SVG rendering function with proper visibility
      const renderSVG = () => {
        const lines = modelViewer.querySelectorAll(".dimensionLine");

        const drawLine = (
          svgLine: SVGLineElement,
          dotHotspot1: string,
          dotHotspot2: string,
          dimensionHotspot?: string,
        ) => {
          try {
            const dot1 = modelViewer.queryHotspot(dotHotspot1);
            const dot2 = modelViewer.queryHotspot(dotHotspot2);
            const dimensionElement = dimensionHotspot
              ? modelViewer.querySelector(`[slot="${dimensionHotspot}"]`)
              : null;

            if (dot1 && dot2 && dot1.canvasPosition && dot2.canvasPosition) {
              svgLine.setAttribute("x1", dot1.canvasPosition.x.toString());
              svgLine.setAttribute("y1", dot1.canvasPosition.y.toString());
              svgLine.setAttribute("x2", dot2.canvasPosition.x.toString());
              svgLine.setAttribute("y2", dot2.canvasPosition.y.toString());

              // Control visibility based on camera facing
              if (dimensionElement && dimensionHotspot) {
                // Get camera orbit
                const cameraOrbit = modelViewer.getCameraOrbit();
                const theta = cameraOrbit?.theta || 0;
                const phi = cameraOrbit?.phi || 0;

                // Get the normal for this dimension
                const normalStr = dimensionNormals[dimensionHotspot] || "1 0 0";
                const normalParts = normalStr.split(" ").map(Number);

                // Calculate camera direction (simplified)
                const cameraX = Math.sin(theta) * Math.sin(phi);
                const cameraY = Math.cos(phi);
                const cameraZ = Math.cos(theta) * Math.sin(phi);

                // Dot product between camera direction and hotspot normal
                const dot =
                  cameraX * normalParts[0] +
                  cameraY * normalParts[1] +
                  cameraZ * normalParts[2];

                // Show dimension and line when facing the camera (dot > 0.1)
                // Hide when looking from behind (dot < 0.1)
                const shouldBeVisible = dot > 0.1;

                if (shouldBeVisible) {
                  svgLine.style.display = "block";
                  dimensionElement.style.display = "block";
                } else {
                  svgLine.style.display = "none";
                  dimensionElement.style.display = "none";
                }
              } else {
                // No dimension hotspot, just show the line
                svgLine.style.display = "block";
              }
            } else {
              svgLine.style.display = "none";
              if (dimensionElement) {
                dimensionElement.style.display = "none";
              }
            }
          } catch (error) {
            // Silently fail - don't spam console
          }
        };

        // Draw all lines
        drawLine(
          lines[0],
          "hotspot-dot+X-Y+Z",
          "hotspot-dot+X-Y-Z",
          "hotspot-dim+X-Y",
        );
        drawLine(
          lines[1],
          "hotspot-dot+X-Y-Z",
          "hotspot-dot+X+Y-Z",
          "hotspot-dim+X-Z",
        );
        drawLine(lines[2], "hotspot-dot+X+Y-Z", "hotspot-dot-X+Y-Z");
        drawLine(
          lines[3],
          "hotspot-dot-X+Y-Z",
          "hotspot-dot-X-Y-Z",
          "hotspot-dim-X-Z",
        );
        drawLine(
          lines[4],
          "hotspot-dot-X-Y-Z",
          "hotspot-dot-X-Y+Z",
          "hotspot-dim-X-Y",
        );
      };

      // Store the render function reference
      renderSVGRef.current = renderSVG;

      // Initial render
      setTimeout(() => {
        renderSVG();
      }, 300);

      // Update on camera change
      modelViewer.addEventListener("camera-change", renderSVG);

      // Handle AR sessions - hide dimensions in AR
      modelViewer.addEventListener("ar-status", (event: any) => {
        const dimElements = [
          ...modelViewer.querySelectorAll(".dim"),
          modelViewer.querySelector("#dimLines"),
        ].filter((el) => el);

        if (event.detail.status === "session-started") {
          dimElements.forEach((element) => {
            element.style.display = "none";
          });
        } else if (event.detail.status === "session-ended") {
          setTimeout(() => {
            // Re-render after AR session
            renderSVG();
          }, 100);
        }
      });

      console.log("Dimension hotspots initialized");
    } catch (error) {
      console.error("Error setting up dimension hotspots:", error);
    }
  };

  // Remove dimension hotspots
  const removeDimensionHotspots = () => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    // Remove SVG lines
    const dimLines = modelViewer.querySelector("#dimLines");
    if (dimLines) dimLines.remove();

    // Remove all hotspot elements
    const hotspots = [
      "hotspot-dot+X-Y+Z",
      "hotspot-dim+X-Y",
      "hotspot-dot+X-Y-Z",
      "hotspot-dim+X-Z",
      "hotspot-dot+X+Y-Z",
      "hotspot-dim+Y-Z",
      "hotspot-dot-X+Y-Z",
      "hotspot-dim-X-Z",
      "hotspot-dot-X-Y-Z",
      "hotspot-dim-X-Y",
      "hotspot-dot-X-Y+Z",
    ];

    hotspots.forEach((slot) => {
      const element = modelViewer.querySelector(`[slot="${slot}"]`);
      if (element) element.remove();
    });

    // Remove event listeners
    if (renderSVGRef.current) {
      modelViewer.removeEventListener("camera-change", renderSVGRef.current);
      renderSVGRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      removeDimensionHotspots();
    };
  }, []);

  // Load available material variants from the model
  const loadModelVariants = () => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const trySetVariants = () => {
      try {
        const variants = modelViewer.availableVariants;
        if (variants && variants.length > 0) {
          setAvailableVariants(["default", ...variants]);
          console.log("Available variants:", variants);
        } else {
          setAvailableVariants(["default"]);
          console.log("No variants available");
        }
      } catch (error) {
        console.error("Error loading variants:", error);
        setAvailableVariants(["default"]);
      }
    };

    if (modelViewer.loaded) {
      trySetVariants();
    } else {
      modelViewer.addEventListener("load", trySetVariants, { once: true });
    }
  };

  // Change the current variant
  const changeVariant = (variantName: string) => {
    try {
      const modelViewer = modelViewerRef.current;
      if (!modelViewer) return;

      setCurrentVariant(variantName);

      if (variantName === "default") {
        modelViewer.variantName = null;
      } else {
        modelViewer.variantName = variantName;
      }

      console.log(`Changed variant to: ${variantName}`);
    } catch (error) {
      console.error("Error changing variant:", error);
    }
  };

  // Activate AR
  const activateAR = () => {
    try {
      const modelViewer = modelViewerRef.current;
      if (!modelViewer || !modelViewer.canActivateAR) {
        console.log("AR not supported or model viewer not available");
        toast.error("AR not supported on this device");
        return;
      }

      console.log(`Activating AR with variant: ${currentVariant}`);
      modelViewer.activateAR();
    } catch (error) {
      console.error("Error activating AR:", error);
      toast.error("Failed to activate AR");
    }
  };

  // Record view analytics
  useEffect(() => {
    if (viewRecorded || !fileId || !modelUrl) return;

    const recordView = async () => {
      try {
        setViewRecorded(true);
        await fetch(`/api/models/record-view/${fileId}`, {
          method: "POST",
        });
        console.log("View recorded successfully");
      } catch (error) {
        console.error("Failed to record view:", error);
        setViewRecorded(false);
      }
    };

    recordView();
  }, [fileId, viewRecorded, modelUrl]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  // Show error states with authentication handling
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            {error.includes("not found") ? "🔍" : "🔒"}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {error.includes("not found")
              ? "Model Not Found"
              : "Access Restricted"}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>

          {requiresAuth && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                This model is private. Please log in to access it.
              </p>
              <LoginLink>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Log In to View
                </Button>
              </LoginLink>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mt-4"
          >
            Go back to home
          </Button>
        </div>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Model Not Available</h1>
          <p className="text-muted-foreground">
            The requested 3D model could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <ModelViewer
        src={modelUrl}
        alt={modelData?.name || "3D model viewer"}
        height="100vh"
        width="100%"
        autoRotate={false}
        shadowIntensity={1.5}
        environmentImage="neutral"
        className="w-full h-full"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        disable-tap
        ref={modelViewerRef}
        aria-label="3D model"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
      />

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col space-between space-y-1.5 z-10">
        {/* AR Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-11 w-11"
                size="icon"
                variant="outline"
                onClick={activateAR}
                disabled={!isARSupported}
                aria-label="View in Augmented Reality"
              >
                <ScanEye
                  size={40}
                  color={isARSupported ? "#000000" : "#999999"}
                  strokeWidth={1}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>
                {isARSupported
                  ? "See it in your space"
                  : "AR not supported on this device"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* QR Code Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="h-11 w-11"
                      size="icon"
                      variant="outline"
                      aria-label="View QR Code"
                    >
                      <ScanQrCode size={40} color="#000000" strokeWidth={1} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Scan the QR Code</DialogTitle>
                      <DialogDescription>
                        Scan this QR code with your mobile device to view this
                        3D model
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-4">
                      <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          currentUrl,
                        )}`}
                        width={200}
                        height={200}
                        alt="QR Code of this page"
                      />
                      <p className="mt-4 text-sm text-gray-500">
                        This QR code links to the current page URL
                      </p>
                    </div>
                    <DialogClose asChild>
                      <Button type="button" className="w-full">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>QR Code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Dimensions Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={`h-11 w-11 ${showDimensions ? "bg-blue-100 border-blue-300" : ""}`}
                size="icon"
                variant="outline"
                onClick={toggleDimensions}
                aria-label="View Dimensions"
              >
                <Ruler
                  size={40}
                  color={showDimensions ? "#16a5e6" : "#000000"}
                  strokeWidth={1}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>{showDimensions ? "Hide Dimensions" : "Show Dimensions"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Settings Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      className="h-11 w-11"
                      size="icon"
                      variant="outline"
                      aria-label="View material variants"
                    >
                      <Settings strokeWidth={1} size={28} />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle>Material Variants</DrawerTitle>
                        <DrawerDescription>
                          Choose different materials available for this model
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4">
                        <div className="mb-6">
                          <h3 className="text-sm font-medium mb-2">
                            Select Material:
                          </h3>
                          {availableVariants.length > 0 ? (
                            <Select
                              value={currentVariant || "default"}
                              onValueChange={changeVariant}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select variant" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableVariants.map((variant) => (
                                  <SelectItem key={variant} value={variant}>
                                    {variant.charAt(0).toUpperCase() +
                                      variant.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No material variants available for this model
                            </p>
                          )}
                        </div>

                        <h3 className="text-sm font-medium mb-2">
                          Available Materials:
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {availableVariants.length > 0 ? (
                            availableVariants.map(
                              (variant) =>
                                variant !== "default" && (
                                  <div
                                    key={variant}
                                    className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                                      currentVariant === variant
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300"
                                    }`}
                                    onClick={() => changeVariant(variant)}
                                  >
                                    <div className="h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                                      <span className="text-sm text-gray-500">
                                        {variant}
                                      </span>
                                    </div>
                                    <p className="text-xs font-medium truncate">
                                      {variant.charAt(0).toUpperCase() +
                                        variant.slice(1)}
                                    </p>
                                    {currentVariant === variant && (
                                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="10"
                                          height="10"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="white"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                ),
                            )
                          ) : (
                            <div className="col-span-2 text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                              This model doesn't include material variants
                            </div>
                          )}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button>Done</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>Materials</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Model info overlay */}
      {modelData && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-xs shadow-lg z-10">
          <h3 className="font-semibold text-lg mb-1">{modelData.name}</h3>
          {modelData.description && (
            <p className="text-sm text-gray-600 mb-2">
              {modelData.description}
            </p>
          )}
          {modelData.fileSize && (
            <p className="text-xs text-gray-500">
              Size: {(modelData.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      )}

      {/* CSS for dimensions */}
      <style jsx global>{`
        .dot {
          display: none;
        }

        .dim {
          border-radius: 4px;
          border: none;
          box-sizing: border-box;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
          color: rgba(0, 0, 0, 0.8);
          display: block;
          font-family:
            Futura,
            Helvetica Neue,
            sans-serif;
          font-size: 14px;
          font-weight: 700;
          max-width: 128px;
          overflow-wrap: break-word;
          padding: 8px 12px;
          position: absolute;
          width: max-content;
          height: max-content;
          transform: translate3d(-50%, -50%, 0);
          pointer-events: none;
          --min-hotspot-opacity: 0;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px) contrast(0.89) saturate(1.27);
          -webkit-backdrop-filter: blur(8px) contrast(0.89) saturate(1.27);
          border: 1px solid rgba(255, 255, 255, 0.4);
          z-index: 10;
        }

        @media only screen and (max-width: 800px) {
          .dim {
            font-size: 12px;
            padding: 6px 10px;
            max-width: 100px;
          }
        }

        .dimensionLineContainer {
          pointer-events: none;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
        }

        .dimensionLine {
          stroke: #16a5e6;
          stroke-width: 2;
          stroke-dasharray: 2;
        }

        .hide {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
