//@ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import ModelViewer from "@/components/ModelViewer";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Ruler,
  QrCodeIcon as ScanQrCode,
  ScanEye,
  Info,
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

interface ModelData {
  $id: string;
  name: string;
  description: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  userId: string;
  isPublic?: boolean;
  createdAt: string;
}

export default function ModelViewPage() {
  const params = useParams();
  const fileId = params.fileId as string;

  // Model data and loading states
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [modelUrl, setModelUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Viewer states
  const [currentUrl, setCurrentUrl] = useState("");
  const [isARSupported, setIsARSupported] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [availableVariants, setAvailableVariants] = useState<string[]>([]);
  const [currentVariant, setCurrentVariant] = useState<string | null>(null);
  const arSessionActive = useRef<boolean>(false);
  const dimensionsSetup = useRef<boolean>(false);

  // Fetch model data and generate URL
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching model data for fileId:", fileId);

        // First, try to get model metadata (optional - for display info)
        try {
          const response = await fetch(`/api/models/get/${fileId}`);
          if (response.ok) {
            const data = await response.json();
            setModelData(data.model);
            console.log("Model metadata loaded:", data.model);
          } else {
            console.log(
              "Could not fetch model metadata, proceeding with file only"
            );
          }
        } catch (metaError) {
          console.log("Could not fetch model metadata:", metaError);
        }

        // Use our secure proxy API - this hides the direct Appwrite URL
        const secureFileUrl = `/api/models/view/${fileId}`;
        console.log("Using secure proxy URL:", secureFileUrl);

        // Test if the proxy endpoint works
        try {
          const testResponse = await fetch(secureFileUrl, { method: "HEAD" });
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

    if (fileId) {
      fetchModelData();
    }
  }, [fileId]);

  // Check AR support and load variants
  useEffect(() => {
    if (!modelUrl) return;

    const checkARSupport = () => {
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer) {
        setIsARSupported((modelViewer as any).canActivateAR === true);
      }
    };

    const timer = setTimeout(() => {
      checkARSupport();
      loadModelVariants();
    }, 1000);

    return () => clearTimeout(timer);
  }, [modelUrl]);

  // Set up AR status monitoring
  useEffect(() => {
    const modelViewer = document.querySelector("model-viewer") as any;
    if (!modelViewer) return;

    const handleARStatus = (event: any) => {
      console.log(`AR Status: ${event.detail.status}`);

      if (event.detail.status === "session-started") {
        arSessionActive.current = true;
        setTimeout(() => {
          if (currentVariant) {
            console.log(`Applying variant in AR: ${currentVariant}`);
            modelViewer.variantName =
              currentVariant === "default" ? null : currentVariant;
          }
        }, 300);
      } else if (event.detail.status === "session-ended") {
        arSessionActive.current = false;
        setTimeout(() => {
          if (currentVariant) {
            modelViewer.variantName =
              currentVariant === "default" ? null : currentVariant;
          }
        }, 100);
      }
    };

    modelViewer.addEventListener("ar-status", handleARStatus);
    return () => {
      modelViewer.removeEventListener("ar-status", handleARStatus);
    };
  }, [currentVariant]);

  // Load available material variants from the model
  const loadModelVariants = () => {
    const modelViewer: any = document.querySelector("model-viewer");
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
      const modelViewer = document.querySelector("model-viewer") as any;
      if (!modelViewer) return;

      modelViewer.variantName = variantName === "default" ? null : variantName;
      setCurrentVariant(variantName);

      if (modelViewer) {
        modelViewer.setAttribute("data-ar-variant", variantName);
      }

      console.log(`Changed variant to: ${variantName}`);
    } catch (error) {
      console.error("Error changing variant:", error);
    }
  };

  // Activate AR
  const activateAR = () => {
    try {
      const modelViewer = document.querySelector("model-viewer") as any;
      if (!modelViewer || !modelViewer.canActivateAR) {
        console.log("AR not supported or model viewer not available");
        return;
      }

      console.log(`Current variant before AR: ${currentVariant}`);

      if (currentVariant) {
        modelViewer.setAttribute("data-current-variant", currentVariant);
        modelViewer.dataset.arVariant = currentVariant;
        modelViewer.variantName =
          currentVariant === "default" ? null : currentVariant;
        console.log(`Variant set before AR: ${currentVariant}`);
      }

      setTimeout(() => {
        if (currentVariant) {
          modelViewer.variantName =
            currentVariant === "default" ? null : currentVariant;
        }
        modelViewer.activateAR();
      }, 50);
    } catch (error) {
      console.error("Error activating AR:", error);
    }
  };

  // Fixed toggle dimensions function
  const toggleDimensions = () => {
    const newShowDimensions = !showDimensions;
    setShowDimensions(newShowDimensions);

    if (newShowDimensions) {
      // Reset the setup flag when enabling
      dimensionsSetup.current = false;
      setTimeout(() => {
        setupDimensions();
      }, 100);
    } else {
      // Hide all dimension elements
      document.querySelectorAll(".hotspot-element").forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      const dimLines = document.getElementById("dimLines");
      if (dimLines) {
        dimLines.style.display = "none";
      }

      // Reset setup flag
      dimensionsSetup.current = false;
    }
  };

  // Fixed setup dimensions function
  const setupDimensions = () => {
    const modelViewer = document.querySelector("model-viewer");
    if (!modelViewer || dimensionsSetup.current) return;

    const createDimensionsWhenReady = () => {
      if ((modelViewer as any).loaded && !dimensionsSetup.current) {
        dimensionsSetup.current = true;
        createDimensionElements(modelViewer as any);
      }
    };

    if ((modelViewer as any).loaded) {
      createDimensionsWhenReady();
    } else {
      modelViewer.addEventListener("load", createDimensionsWhenReady, {
        once: true,
      });
    }
  };

  // Fixed create dimension elements function
  const createDimensionElements = (modelViewer: any) => {
    try {
      // Remove existing hotspots and lines first
      document
        .querySelectorAll(".hotspot-element")
        .forEach((element) => element.remove());
      const existingLines = document.getElementById("dimLines");
      if (existingLines) {
        existingLines.remove();
      }

      // Get model dimensions and center
      const center = modelViewer.getBoundingBoxCenter();
      const size = modelViewer.getDimensions();
      const x2 = size.x / 2;
      const y2 = size.y / 2;
      const z2 = size.z / 2;

      // Create hotspots with better positioning
      const hotspots = [
        {
          name: "hotspot-dot+X-Y+Z",
          position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`,
          normal: "1 0 0",
          type: "dot",
        },
        {
          name: "hotspot-dim+X-Y",
          position: `${center.x + x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`,
          normal: "1 0 0",
          type: "dim",
          text: `${(size.z * 100).toFixed(0)} cm`,
        },
        {
          name: "hotspot-dot+X-Y-Z",
          position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`,
          normal: "1 0 0",
          type: "dot",
        },
        {
          name: "hotspot-dim+X-Z",
          position: `${center.x + x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`,
          normal: "1 0 0",
          type: "dim",
          text: `${(size.y * 100).toFixed(0)} cm`,
        },
        {
          name: "hotspot-dot+X+Y-Z",
          position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`,
          normal: "0 1 0",
          type: "dot",
        },
        {
          name: "hotspot-dim+Y-Z",
          position: `${center.x} ${center.y + y2 * 1.1} ${center.z - z2 * 1.1}`,
          normal: "0 1 0",
          type: "dim",
          text: `${(size.x * 100).toFixed(0)} cm`,
        },
        {
          name: "hotspot-dot-X+Y-Z",
          position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`,
          normal: "0 1 0",
          type: "dot",
        },
        {
          name: "hotspot-dim-X-Z",
          position: `${center.x - x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`,
          normal: "-1 0 0",
          type: "dim",
          text: `${(size.y * 100).toFixed(0)} cm`,
        },
        {
          name: "hotspot-dot-X-Y-Z",
          position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`,
          normal: "-1 0 0",
          type: "dot",
        },
        {
          name: "hotspot-dim-X-Y",
          position: `${center.x - x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`,
          normal: "-1 0 0",
          type: "dim",
          text: `${(size.z * 100).toFixed(0)} cm`,
        },
        {
          name: "hotspot-dot-X-Y+Z",
          position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`,
          normal: "-1 0 0",
          type: "dot",
        },
      ];

      // Create hotspots
      hotspots.forEach((spot) => {
        const hotspot = document.createElement("button");
        hotspot.setAttribute("class", `hotspot-element ${spot.type}`);
        hotspot.setAttribute("slot", spot.name);
        hotspot.dataset.position = spot.position;
        hotspot.dataset.normal = spot.normal;

        if (spot.text) {
          hotspot.textContent = spot.text;
        }

        // Initially hide dots, show dims only when facing camera
        if (spot.type === "dot") {
          hotspot.style.display = "none";
        }

        modelViewer.appendChild(hotspot);
      });

      // Create SVG for dimension lines
      const dimLines = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      dimLines.id = "dimLines";
      dimLines.setAttribute("width", "100%");
      dimLines.setAttribute("height", "100%");
      dimLines.setAttribute("class", "dimensionLineContainer");

      // Create dimension lines
      for (let i = 0; i < 5; i++) {
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("class", "dimensionLine");
        dimLines.appendChild(line);
      }

      modelViewer.appendChild(dimLines);

      // Set up camera change handler for SVG updates
      const updateHandler = () => updateSVGLines();
      modelViewer.addEventListener("camera-change", updateHandler);

      // Store the handler for cleanup
      modelViewer._dimensionUpdateHandler = updateHandler;

      // Initial update
      setTimeout(() => updateSVGLines(), 100);
    } catch (error) {
      console.error("Error setting up dimensions:", error);
    }
  };

  // Fixed update SVG lines function
  const updateSVGLines = () => {
    if (!showDimensions) return;

    const modelViewer: any = document.querySelector("model-viewer");
    if (!modelViewer) return;

    const lines = document.querySelectorAll(".dimensionLine");
    if (!lines.length) return;

    // Function to draw line between two hotspots
    const drawLine = (
      svgLine: SVGLineElement,
      spot1: string,
      spot2: string,
      dimSpot?: string
    ) => {
      const dotHotspot1 = modelViewer.queryHotspot(spot1);
      const dotHotspot2 = modelViewer.queryHotspot(spot2);
      const dimensionHotspot = dimSpot
        ? modelViewer.queryHotspot(dimSpot)
        : null;

      if (dotHotspot1 && dotHotspot2) {
        svgLine.setAttribute("x1", dotHotspot1.canvasPosition.x);
        svgLine.setAttribute("y1", dotHotspot1.canvasPosition.y);
        svgLine.setAttribute("x2", dotHotspot2.canvasPosition.x);
        svgLine.setAttribute("y2", dotHotspot2.canvasPosition.y);

        // Handle visibility based on camera angle
        if (dimensionHotspot && !dimensionHotspot.facingCamera) {
          svgLine.style.display = "none";
        } else {
          svgLine.style.display = "block";
        }
      }
    };

    // Update dimension text visibility
    document.querySelectorAll(".hotspot-element.dim").forEach((el) => {
      const slot = el.getAttribute("slot");
      const hotspot = modelViewer.queryHotspot(slot);
      if (hotspot && !hotspot.facingCamera) {
        (el as HTMLElement).style.display = "none";
      } else {
        (el as HTMLElement).style.display = "block";
      }
    });

    // Draw all dimension lines
    drawLine(
      lines[0] as SVGLineElement,
      "hotspot-dot+X-Y+Z",
      "hotspot-dot+X-Y-Z",
      "hotspot-dim+X-Y"
    );
    drawLine(
      lines[1] as SVGLineElement,
      "hotspot-dot+X-Y-Z",
      "hotspot-dot+X+Y-Z",
      "hotspot-dim+X-Z"
    );
    drawLine(
      lines[2] as SVGLineElement,
      "hotspot-dot+X+Y-Z",
      "hotspot-dot-X+Y-Z"
    );
    drawLine(
      lines[3] as SVGLineElement,
      "hotspot-dot-X+Y-Z",
      "hotspot-dot-X-Y-Z",
      "hotspot-dim-X-Z"
    );
    drawLine(
      lines[4] as SVGLineElement,
      "hotspot-dot-X-Y-Z",
      "hotspot-dot-X-Y+Z",
      "hotspot-dim-X-Y"
    );
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      const modelViewer = document.querySelector("model-viewer") as any;
      if (modelViewer && modelViewer._dimensionUpdateHandler) {
        modelViewer.removeEventListener(
          "camera-change",
          modelViewer._dimensionUpdateHandler
        );
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Model Not Found</h1>
          <p className="text-muted-foreground">
            The requested 3D model could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <ModelViewer
        src={modelUrl}
        alt={modelData?.name || "3D model viewer"}
        height="100dvh"
        width="100%"
        autoRotate={false}
        shadowIntensity={1.5}
        environmentImage="neutral"
        className="shadow-2xl"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        currentVariant={currentVariant}
      />

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col space-between space-y-1.5">
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
                    <Button className="h-11 w-11" size="icon" variant="outline">
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
                          currentUrl
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
                className={`h-11 w-11 ${showDimensions ? "bg-blue-100" : ""}`}
                size="icon"
                variant="outline"
                onClick={toggleDimensions}
              >
                <Ruler
                  size={40}
                  color={showDimensions ? "#16a5e6" : "#000000"}
                  strokeWidth={1}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>Dimensions</p>
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
                    <Button className="h-11 w-11" size="icon" variant="outline">
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
                                )
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

      {/* Info Button */}
      <div className="absolute bottom-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-11 w-11" size="icon" variant="outline">
                      <Info size={40} color="#000000" strokeWidth={1} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>How to Use This 3D Viewer</DialogTitle>
                      <DialogDescription>
                        Instructions for interacting with the 3D model
                        {modelData?.name && ` of ${modelData.name}`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <h3 className="text-lg font-medium mb-2">
                        Viewing Controls:
                      </h3>
                      <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>Click and drag to rotate the model</li>
                        <li>Scroll or pinch to zoom in/out</li>
                        <li>Right-click and drag to pan</li>
                      </ul>

                      <h3 className="text-lg font-medium mb-2">
                        Toolbar Options:
                      </h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>AR View:</strong> See the product in your
                          physical space
                        </li>
                        <li>
                          <strong>QR Code:</strong> Share or open on a mobile
                          device
                        </li>
                        <li>
                          <strong>Dimensions:</strong> View product's
                          measurements
                        </li>
                        <li>
                          <strong>Materials:</strong> Change material variants
                          of the model
                        </li>
                      </ul>
                    </div>
                    <DialogClose asChild>
                      <Button type="button" className="w-full">
                        Got it
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p>Information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

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
          font-family: Futura, Helvetica Neue, sans-serif;
          font-size: 1em;
          font-weight: 700;
          max-width: 128px;
          background-color: white;
          overflow-wrap: break-word;
          padding: 0.5em 1em;
          position: absolute;
          width: max-content;
          height: max-content;
          transform: translate3d(-50%, -50%, 0);
          pointer-events: none;
          --min-hotspot-opacity: 0;
        }

        @media only screen and (max-width: 800px) {
          .dim {
            font-size: 3vw;
          }
        }

        .dimensionLineContainer {
          pointer-events: none;
          display: block;
        }

        .dimensionLine {
          stroke: #16a5e6;
          stroke-width: 2;
          stroke-dasharray: 2;
        }
      `}</style>
    </div>
  );
}
