"use client"
import React, { useState, useEffect, useRef } from "react";
import ModelViewer from "@/components/ModelViewer";
import { Button } from "@/components/ui/button";
import { Settings, Ruler, ScanQrCode, ScanEye, Info } from 'lucide-react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// @ts-ignore
export default function Model() {
    const [currentUrl, setCurrentUrl] = useState('');
    const [isARSupported, setIsARSupported] = useState(false);
    const [showDimensions, setShowDimensions] = useState(false);
    const [availableVariants, setAvailableVariants] = useState<string[]>([]);
    const [currentVariant, setCurrentVariant] = useState<string | null>(null);
    const modelViewerRef = useRef<HTMLElement | null>(null);
    const arSessionActive = useRef<boolean>(false);

    useEffect(() => {
        // Set the current URL when component mounts
        setCurrentUrl(window.location.href);

        // Check if AR is supported
        const checkARSupport = () => {
            const modelViewer = document.querySelector('model-viewer');
            if (modelViewer) {
                // Check if AR is supported
                setIsARSupported((modelViewer as any).canActivateAR === true);
            }
        };

        // Wait for the component to fully mount
        const timer = setTimeout(() => {
            checkARSupport();
            loadModelVariants();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Set up AR status monitoring
    useEffect(() => {
        const modelViewer = document.querySelector('model-viewer') as any;
        if (!modelViewer) return;

        // Handle AR status changes
        const handleARStatus = (event: any) => {
            console.log(`AR Status: ${event.detail.status}`);

            if (event.detail.status === 'session-started') {
                arSessionActive.current = true;

                // Force variant application in AR session
                setTimeout(() => {
                    if (currentVariant) {
                        console.log(`Applying variant in AR: ${currentVariant}`);
                        modelViewer.variantName = currentVariant === 'default' ? null : currentVariant;
                    }
                }, 300); // Longer timeout to ensure AR session is fully initialized
            } else if (event.detail.status === 'session-ended') {
                arSessionActive.current = false;

                // Re-apply variant after AR session ends
                setTimeout(() => {
                    if (currentVariant) {
                        modelViewer.variantName = currentVariant === 'default' ? null : currentVariant;
                    }
                }, 100);
            }
        };

        // Add AR event listener
        modelViewer.addEventListener('ar-status', handleARStatus);

        return () => {
            modelViewer.removeEventListener('ar-status', handleARStatus);
        };
    }, [currentVariant]); // Re-add listener when currentVariant changes

    // Function to load available material variants from the model
    const loadModelVariants = () => {
        const modelViewer: any = document.querySelector('model-viewer');
        if (!modelViewer) return;

        const trySetVariants = () => {
            try {
                const variants = modelViewer.availableVariants;
                if (variants && variants.length > 0) {
                    setAvailableVariants(['default', ...variants]);
                    console.log('Available variants:', variants);
                } else {
                    setAvailableVariants(['default']);
                    console.log('No variants available');
                }
            } catch (error) {
                console.error('Error loading variants:', error);
                setAvailableVariants(['default']);
            }
        };
        if (modelViewer.loaded) {
            trySetVariants(); // load immediately
        } else {
            modelViewer.addEventListener('load', trySetVariants, { once: true });
        }
    };

    // Function to change the current variant
    const changeVariant = (variantName: string) => {
        try {
            const modelViewer = document.querySelector('model-viewer') as any;
            if (!modelViewer) return;

            // Apply variant and update state
            modelViewer.variantName = variantName === 'default' ? null : variantName;
            setCurrentVariant(variantName);

            // Store for AR use
            if (modelViewer) {
                modelViewer.setAttribute('data-ar-variant', variantName);
            }

            console.log(`Changed variant to: ${variantName}`);
        } catch (error) {
            console.error('Error changing variant:', error);
        }
    };

    // Helper for debugging AR variant issues
    const debugARVariant = () => {
        const modelViewer = document.querySelector('model-viewer') as any;
        if (!modelViewer) return;

        // Force the model to update its variant via scene graph manipulation
        if (currentVariant && currentVariant !== 'default') {
            try {
                // Get the loaded model
                const model = modelViewer.model;
                if (model) {
                    console.log('Available variants:', modelViewer.availableVariants);
                    console.log('Current variant:', modelViewer.variantName);

                    // Force variant application through scene update
                    modelViewer.variantName = null;
                    setTimeout(() => {
                        modelViewer.variantName = currentVariant;
                        console.log('Forced variant update to:', currentVariant);
                    }, 50);
                }
            } catch (err) {
                console.error('Error in debug AR variant:', err);
            }
        }
    };

    const ensureARVariant = () => {
        const modelViewer = document.querySelector('model-viewer') as any;
        if (!modelViewer) return;

        // Get the stored variant
        const storedVariant = modelViewer.getAttribute('data-current-variant') || currentVariant;

        if (storedVariant && storedVariant !== 'default') {
            console.log(`Reapplying variant in AR: ${storedVariant}`);
            modelViewer.variantName = storedVariant;
        }
    };

// Then add this to your AR session handling
    useEffect(() => {
        const modelViewer = document.querySelector('model-viewer') as any;
        if (!modelViewer) return;

        const handleARStatus = (event: any) => {
            // Existing code...

            if (event.detail.status === 'session-started') {
                // Existing code...

                // Add this new call
                setTimeout(ensureARVariant, 300);
            }
        };

        modelViewer.addEventListener('ar-status', handleARStatus);
        return () => modelViewer.removeEventListener('ar-status', handleARStatus);
    }, [currentVariant]);

    // Function to activate AR

    const activateAR = () => {
        try {
            const modelViewer = document.querySelector('model-viewer') as any;
            if (!modelViewer || !modelViewer.canActivateAR) {
                console.log("AR not supported or model viewer not available");
                return;
            }

            console.log(`Current variant before AR: ${currentVariant}`);

            // Critical step: Store the current variant name directly in the model-viewer element
            if (currentVariant) {
                // Set as both a data attribute and a property
                modelViewer.setAttribute('data-current-variant', currentVariant);
                modelViewer.dataset.arVariant = currentVariant;

                // Force variant application right before AR
                modelViewer.variantName = currentVariant === 'default' ? null : currentVariant;

                console.log(`Variant set before AR: ${currentVariant}`);
            }

            // Add a very small delay before activating AR to ensure the variant is applied
            setTimeout(() => {
                // Try again one more time right before AR activation
                if (currentVariant) {
                    modelViewer.variantName = currentVariant === 'default' ? null : currentVariant;
                }

                modelViewer.activateAR();
            }, 50);
        } catch (error) {
            console.error('Error activating AR:', error);
        }
    };

    // Function to toggle dimensions display
    const toggleDimensions = () => {
        setShowDimensions(prev => !prev);

        // We need to wait for the model to load before creating dimensions
        if (!showDimensions) {
            // Wait for the next render cycle to ensure modelViewer is accessible
            setTimeout(() => {
                setupDimensions();
            }, 100);
        } else {
            // If turning off dimensions, hide all dimension elements
            document.querySelectorAll('.hotspot-element').forEach(el => {
                el.setAttribute('style', 'display: none');
            });

            const dimLines = document.getElementById('dimLines');
            if (dimLines) {
                dimLines.setAttribute('style', 'display: none');
            }
        }
    };

    // Function to set up dimension hotspots and lines
    const setupDimensions = () => {
        const modelViewer = document.querySelector('model-viewer');
        if (!modelViewer) return;

        // Wait for the model to load
        if ((modelViewer as any).loaded) {
            createDimensionElements(modelViewer as any);
        } else {
            modelViewer.addEventListener('load', () => {
                createDimensionElements(modelViewer as any);
            }, { once: true });
        }
    };

    // Function to create dimension elements
    const createDimensionElements = (modelViewer: any) => {
        try {
            // Get model dimensions and center
            const center = modelViewer.getBoundingBoxCenter();
            const size = modelViewer.getDimensions();
            const x2 = size.x / 2;
            const y2 = size.y / 2;
            const z2 = size.z / 2;

            // Create and position hotspots programmatically
            const hotspots = [
                { name: 'hotspot-dot+X-Y+Z', position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`, normal: '1 0 0', type: 'dot' },
                { name: 'hotspot-dim+X-Y', position: `${center.x + x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`, normal: '1 0 0', type: 'dim', text: `${(size.z * 100).toFixed(0)} cm` },
                { name: 'hotspot-dot+X-Y-Z', position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`, normal: '1 0 0', type: 'dot' },
                { name: 'hotspot-dim+X-Z', position: `${center.x + x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`, normal: '1 0 0', type: 'dim', text: `${(size.y * 100).toFixed(0)} cm` },
                { name: 'hotspot-dot+X+Y-Z', position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`, normal: '0 1 0', type: 'dot' },
                { name: 'hotspot-dim+Y-Z', position: `${center.x} ${center.y + y2 * 1.1} ${center.z - z2 * 1.1}`, normal: '0 1 0', type: 'dim', text: `${(size.x * 100).toFixed(0)} cm` },
                { name: 'hotspot-dot-X+Y-Z', position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`, normal: '0 1 0', type: 'dot' },
                { name: 'hotspot-dim-X-Z', position: `${center.x - x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`, normal: '-1 0 0', type: 'dim', text: `${(size.y * 100).toFixed(0)} cm` },
                { name: 'hotspot-dot-X-Y-Z', position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`, normal: '-1 0 0', type: 'dot' },
                { name: 'hotspot-dim-X-Y', position: `${center.x - x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`, normal: '-1 0 0', type: 'dim', text: `${(size.z * 100).toFixed(0)} cm` },
                { name: 'hotspot-dot-X-Y+Z', position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`, normal: '-1 0 0', type: 'dot' },
            ];

            // Remove existing hotspots if any
            document.querySelectorAll('.hotspot-element').forEach(element => element.remove());

            // Create hotspots
            hotspots.forEach(spot => {
                // Create hotspot
                const hotspot = document.createElement('button');
                hotspot.setAttribute('class', `hotspot-element ${spot.type}`);
                hotspot.setAttribute('slot', spot.name);
                hotspot.dataset.position = spot.position;
                hotspot.dataset.normal = spot.normal;

                if (spot.text) {
                    hotspot.textContent = spot.text;
                }

                modelViewer.appendChild(hotspot);
            });

            // Create SVG for dimension lines
            if (!document.getElementById('dimLines')) {
                const dimLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                dimLines.id = 'dimLines';
                dimLines.setAttribute('width', '100%');
                dimLines.setAttribute('height', '100%');
                dimLines.setAttribute('class', 'dimensionLineContainer');

                // Create dimension lines
                for (let i = 0; i < 5; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('class', 'dimensionLine');
                    dimLines.appendChild(line);
                }

                modelViewer.appendChild(dimLines);

                // Set up camera change handler for SVG updates
                modelViewer.addEventListener('camera-change', updateSVGLines);
            }

            // Update SVG lines initial positions
            updateSVGLines();
        } catch (error) {
            console.error('Error setting up dimensions:', error);
        }
    };

    // Function to update SVG lines
    const updateSVGLines = () => {
        const modelViewer: any = document.querySelector('model-viewer');
        if (!modelViewer) return;

        const lines = document.querySelectorAll('.dimensionLine');
        if (!lines.length) return;

        // Function to draw line between two hotspots
        const drawLine = (svgLine: SVGLineElement, spot1: string, spot2: string, dimSpot?: string) => {
            const dotHotspot1 = modelViewer.queryHotspot(spot1);
            const dotHotspot2 = modelViewer.queryHotspot(spot2);
            const dimensionHotspot = dimSpot ? modelViewer.queryHotspot(dimSpot) : null;

            if (dotHotspot1 && dotHotspot2) {
                svgLine.setAttribute('x1', dotHotspot1.canvasPosition.x);
                svgLine.setAttribute('y1', dotHotspot1.canvasPosition.y);
                svgLine.setAttribute('x2', dotHotspot2.canvasPosition.x);
                svgLine.setAttribute('y2', dotHotspot2.canvasPosition.y);

                // Handle visibility based on camera angle
                if (dimensionHotspot && !dimensionHotspot.facingCamera) {
                    svgLine.setAttribute('style', 'display: none');
                } else {
                    svgLine.setAttribute('style', 'display: block');
                }
            }

            document.querySelectorAll('.hotspot-element.dim').forEach((el) => {
                const slot = el.getAttribute('slot');
                const hotspot = modelViewer.queryHotspot(slot);
                if (hotspot && !hotspot.facingCamera) {
                    (el as HTMLElement).style.display = 'none';
                } else {
                    (el as HTMLElement).style.display = 'block';
                }
            });
        };

        // Draw all dimension lines
        drawLine(lines[0] as SVGLineElement, 'hotspot-dot+X-Y+Z', 'hotspot-dot+X-Y-Z', 'hotspot-dim+X-Y');
        drawLine(lines[1] as SVGLineElement, 'hotspot-dot+X-Y-Z', 'hotspot-dot+X+Y-Z', 'hotspot-dim+X-Z');
        drawLine(lines[2] as SVGLineElement, 'hotspot-dot+X+Y-Z', 'hotspot-dot-X+Y-Z'); // always visible
        drawLine(lines[3] as SVGLineElement, 'hotspot-dot-X+Y-Z', 'hotspot-dot-X-Y-Z', 'hotspot-dim-X-Z');
        drawLine(lines[4] as SVGLineElement, 'hotspot-dot-X-Y-Z', 'hotspot-dot-X-Y+Z', 'hotspot-dim-X-Y');
    };

    // @ts-ignore
    return (
        <div className="h-full w-full relative">

            <ModelViewer
                ref={modelViewerRef}
                src="./Angie.glb"
                alt="3D model viewer"
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
                            <p>{isARSupported ? "See it in your space" : "AR not supported on this device"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="h-11 w-11" size="icon" variant="outline">
                                            <ScanQrCode size={40} color="#000000" strokeWidth={1}/>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Scan the QR Code</DialogTitle>
                                            <DialogDescription>
                                                Scan this QR code with your mobile device to view this 3D model
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`}
                                                alt="QR Code"
                                                className="h-48 w-48 select-none rounded-md"
                                            />
                                            <p className="mt-4 text-sm text-gray-500">
                                                This QR code links to the current page URL
                                            </p>
                                        </div>
                                        <DialogClose asChild>
                                            <Button type="button" className="w-full">Close</Button>
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

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                className={`h-11 w-11 ${showDimensions ? 'bg-blue-100' : ''}`}
                                size="icon"
                                variant="outline"
                                onClick={toggleDimensions}
                            >
                                <Ruler size={40} color={showDimensions ? "#16a5e6" : "#000000"} strokeWidth={1}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side={"left"}>
                            <p>Dimensions</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

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
                                                <DrawerDescription>Choose different materials available for this model</DrawerDescription>
                                            </DrawerHeader>
                                            <div className="p-4">
                                                {/* Material Variant Selector */}
                                                <div className="mb-6">
                                                    <h3 className="text-sm font-medium mb-2">Select Material:</h3>
                                                    {availableVariants.length > 0 ? (
                                                        <Select
                                                            value={currentVariant || 'default'}
                                                            onValueChange={changeVariant}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select variant" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableVariants.map((variant) => (
                                                                    <SelectItem key={variant} value={variant}>
                                                                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No material variants available for this model</p>
                                                    )}
                                                </div>

                                                {/* Material Variant Preview Cards */}
                                                <h3 className="text-sm font-medium mb-2">Available Materials:</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {availableVariants.length > 0 ? (
                                                        availableVariants.map((variant) => (
                                                            variant !== 'default' && (
                                                                <div
                                                                    key={variant}
                                                                    className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                                                                        currentVariant === variant
                                                                            ? 'border-blue-500 bg-blue-50'
                                                                            : 'border-gray-200 hover:border-blue-300'
                                                                    }`}
                                                                    onClick={() => changeVariant(variant)}
                                                                >
                                                                    <div className="h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                                                                        <span className="text-sm text-gray-500">{variant}</span>
                                                                    </div>
                                                                    <p className="text-xs font-medium truncate">
                                                                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                                                    </p>
                                                                    {currentVariant === variant && (
                                                                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        ))
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
            <div className="absolute bottom-4 right-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="h-11 w-11" size="icon" variant="outline">
                                            <Info size={40} color="#000000" strokeWidth={1}/>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>How to Use This 3D Viewer</DialogTitle>
                                            <DialogDescription>
                                                Instructions for interacting with the 3D model of the product
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <h3 className="text-lg font-medium mb-2">Viewing Controls:</h3>
                                            <ul className="list-disc pl-5 space-y-2 mb-4">
                                                <li>Click and drag to rotate the model</li>
                                                <li>Scroll or pinch to zoom in/out</li>
                                                <li>Right-click and drag to pan</li>
                                            </ul>

                                            <h3 className="text-lg font-medium mb-2">Toolbar Options:</h3>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li><strong>AR View:</strong> See the product in your physical space</li>
                                                <li><strong>QR Code:</strong> Share or open on a mobile device</li>
                                                <li><strong>Dimensions:</strong> View product's measurements</li>
                                                <li><strong>Materials:</strong> Change material variants of the model</li>
                                            </ul>
                                        </div>
                                        <DialogClose asChild>
                                            <Button type="button" className="w-full">Got it</Button>
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
    )
}