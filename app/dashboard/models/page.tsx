"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Trash2,
  RefreshCcw,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
// Custom hook for media queries
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Set the initial value
    const updateMatches = () => {
      setMatches(mediaQueryList.matches);
    };

    // Set up initial state
    updateMatches();

    // Set up event listener for changes
    mediaQueryList.addEventListener("change", updateMatches);

    // Clean up event listener
    return () => {
      mediaQueryList.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
};

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Define the model type
interface Model3D {
  id: string;
  name: string;
  description: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  modelType: string;
}

export default function ModelsPage() {
  useEffect(() => {
    document.title = "3D Model Viewer | My Models";
  }, []);

  const router = useRouter();
  const [models, setModels] = useState<Model3D[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [currentEmbedCode, setCurrentEmbedCode] = useState("");
  const [currentModelName, setCurrentModelName] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API call
        // const response = await fetch('/api/models');
        // const data = await response.json();
        // setModels(data);

        // Mock data for development purposes
        setTimeout(() => {
          const mockData: Model3D[] = [
            {
              id: "1",
              name: "Robot Character",
              description: "Animated robot character for game project",
              fileSize: "24.5 MB",
              fileType: "glb",
              uploadDate: "2025-04-12",
              modelType: "Character",
            },
            {
              id: "2",
              name: "Modern Chair",
              description: "Furniture model for interior design visualization",
              fileSize: "12.3 MB",
              fileType: "glb",
              uploadDate: "2025-04-15",
              modelType: "Furniture",
            },
            {
              id: "3",
              name: "Fantasy Sword",
              description: "Game asset with PBR materials",
              fileSize: "5.7 MB",
              fileType: "glb",
              uploadDate: "2025-05-01",
              modelType: "Prop",
            },
            {
              id: "4",
              name: "Low Poly Tree",
              description: "Environmental asset for outdoor scenes",
              fileSize: "2.1 MB",
              fileType: "glb",
              uploadDate: "2025-05-03",
              modelType: "Environment",
            },
          ];
          setModels(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch models:", error);
        toast("Error", {
          description: "Failed to load models. Please try again.",
        });
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Filter models based on search query
  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.modelType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle model move to recycling bin
  const handleMoveToRecycleBin = async (modelId: string) => {
    try {
      // Replace with your actual API call
      // await fetch(`/api/models/${modelId}/recycle`, { method: 'POST' });

      // Mock successful move
      setModels(models.filter((model) => model.id !== modelId));
      toast("Success", {
        description: "Model has been moved to recycling bin.",
      });
    } catch (error) {
      console.error("Failed to move model to recycling bin:", error);
      toast("Error", {
        description: "Failed to move model to recycling bin. Please try again.",
      });
    }
  };

  // Handle bulk move to recycling bin
  const handleBulkMoveToRecycleBin = async () => {
    try {
      // Replace with your actual API call
      // await Promise.all(selectedItems.map(id => fetch(`/api/models/${id}/recycle`, { method: 'POST' })));

      // Mock successful bulk move
      setModels(models.filter((model) => !selectedItems.includes(model.id)));
      toast("Success", {
        description: `${selectedItems.length} models have been moved to recycling bin.`,
      });
      setSelectedItems([]);
    } catch (error) {
      console.error("Failed to bulk move models to recycling bin:", error);
      toast("Error", {
        description:
          "Failed to move some models to recycling bin. Please try again.",
      });
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredModels.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredModels.map((model) => model.id));
    }
  };

  // Handle single item selection
  const handleSelectItem = (modelId: string) => {
    if (selectedItems.includes(modelId)) {
      setSelectedItems(selectedItems.filter((id) => id !== modelId));
    } else {
      setSelectedItems([...selectedItems, modelId]);
    }
  };

  // Generate embed code
  const getEmbedCode = (modelId: string): string => {
    return `<iframe src="/view/${modelId}" width="600" height="400" frameborder="0" allowfullscreen></iframe>`;
  };

  // Open embed modal/drawer
  const openEmbedModal = (model: Model3D) => {
    setCurrentEmbedCode(getEmbedCode(model.id));
    setCurrentModelName(model.name);
    setEmbedModalOpen(true);
  };

  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(currentEmbedCode);
    toast("Copied", {
      description: "Embed code copied to clipboard",
    });
    setEmbedModalOpen(false);
  };

  // Embed Code Modal/Drawer Component
  const EmbedCodeModal = () => {
    if (isDesktop) {
      return (
        <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Embed Code for {currentModelName}</DialogTitle>
              <DialogDescription>
                Copy this code to embed the 3D model on your website.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea readOnly value={currentEmbedCode} className="h-24" />
              <Button onClick={copyEmbedCode}>Copy to clipboard</Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Embed Code for {currentModelName}</DrawerTitle>
            <DrawerDescription>
              Copy this code to embed the 3D model on your website.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            <Textarea readOnly value={currentEmbedCode} className="h-24 mb-4" />
          </div>
          <DrawerFooter className="pt-2">
            <Button onClick={copyEmbedCode}>Copy to clipboard</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Models Gallery
              </CardTitle>
              <CardDescription>Manage your 3D model collection</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("./trash")}>
                <Trash2 className="mr-2 h-4 w-4" />
                Recycling Bin
              </Button>
              <Button onClick={() => router.push("./upload")}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Model
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {selectedItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1">
                        Delete ({selectedItems.length})
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Move to recycling bin?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will move {selectedItems.length} selected model(s)
                        to the recycling bin. You can restore them later if
                        needed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkMoveToRecycleBin}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter by model type</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        Character
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        Furniture
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        Prop
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        Environment
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        Vehicle
                      </Badge>
                    </div>
                    <h4 className="font-medium">File type</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        GLB
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                      >
                        USDZ
                      </Badge>
                    </div>
                    <Button size="sm" className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  toast("Refreshed", {
                    description: "Model list has been refreshed",
                  });
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>

          {/* Models Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={
                          filteredModels.length > 0 &&
                          selectedItems.length === filteredModels.length
                        }
                        onChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    File Details
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Upload Date
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Model Type
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-muted-foreground mb-2">
                          No models found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={selectedItems.includes(model.id)}
                            onChange={() => handleSelectItem(model.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-sm text-muted-foreground truncate max-w-64">
                            {model.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {model.fileType.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {model.fileSize}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(model.uploadDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge>{model.modelType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/view/${model.id}`)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              toast("Download started", {
                                description: `Downloading ${model.name}...`,
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/edit/${model.id}`)}
                              >
                                Edit details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  openEmbedModal(model);
                                }}
                              >
                                Get embed code
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  handleMoveToRecycleBin(model.id);
                                }}
                              >
                                Move to recycling bin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="px-4">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code Modal/Drawer */}
      <EmbedCodeModal />
    </div>
  );
}
