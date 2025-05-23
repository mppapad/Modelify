"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Upload,
  Filter,
  Globe,
  Lock,
  Edit,
  Loader2,
  RefreshCcw,
  FileText,
} from "lucide-react";

interface Model {
  $id?: string; // Appwrite uses $id
  id?: string; // Fallback for compatibility
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

// Loading Skeleton Components
const ModelRowSkeleton = () => (
  <Card className="mb-4">
    <CardContent className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* File icon skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-48 max-w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 max-w-full"></div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 max-w-full"></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="flex gap-2 flex-wrap">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 lg:p-6">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
    </CardContent>
  </Card>
);

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [updatingModel, setUpdatingModel] = useState(false);
  // Add state to track dropdown open status
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Helper function to get the model ID (handles both $id and id)
  const getModelId = (model: Model): string => {
    return model.$id || model.id || "";
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    let filtered = models;

    if (searchTerm) {
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(
        (model) =>
          getFileExtension(model.fileName).toLowerCase() ===
          filterType.toLowerCase()
      );
    }

    setFilteredModels(filtered);
  }, [models, searchTerm, filterType]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/models/my-models");

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      console.log("Fetched models:", data.models);
      setModels(data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to fetch models. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (modelId: string) => {
    if (!modelId || modelId === "undefined") {
      console.error("Invalid model ID:", modelId);
      toast.error("Error: Invalid model ID");
      return;
    }

    console.log("Deleting model with ID:", modelId);

    try {
      setDeletingId(modelId);

      const response = await fetch(`/api/models/delete/${modelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete model");
      }

      const result = await response.json();

      setModels((prev) =>
        prev.filter((model) => getModelId(model) !== modelId)
      );
      toast.success(result.message || "Model deleted successfully.");
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete model. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const updateModel = async () => {
    if (!editingModel) return;

    const modelId = getModelId(editingModel);
    if (!modelId) {
      toast.error("Invalid model ID");
      return;
    }

    try {
      setUpdatingModel(true);
      const response = await fetch(`/api/models/update/${modelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          isPublic: editIsPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update model");
      }

      const updatedModel = await response.json();

      setModels(
        models.map((model) =>
          getModelId(model) === modelId ? { ...model, ...updatedModel } : model
        )
      );

      closeEditModal();
      toast.success("Model updated successfully.");
    } catch (error) {
      console.error("Failed to update model:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update model. Please try again."
      );
    } finally {
      setUpdatingModel(false);
    }
  };

  const downloadModel = async (model: Model) => {
    try {
      const fileUrl = getFileUrl(model.fileId, true);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = model.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Model download started.");
    } catch (error) {
      console.error("Error downloading model:", error);
      toast.error("Failed to download model. Please try again.");
    }
  };

  const exportModelsData = async () => {
    try {
      setExporting(true);

      const exportData = models.map((model) => ({
        id: getModelId(model),
        name: model.name,
        description: model.description,
        fileName: model.fileName,
        fileSize: model.fileSize,
        mimeType: model.mimeType,
        createdAt: model.createdAt,
        isPublic: model.isPublic,
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `models-export-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success("Models data exported successfully.");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Fixed openEditModal function to properly handle dropdown closure
  const openEditModal = (model: Model) => {
    console.log("Opening edit modal for model:", model);

    // Close any open dropdown first
    setDropdownOpen(null);

    // Small delay to ensure dropdown is closed before opening modal
    setTimeout(() => {
      setEditingModel(model);
      setEditName(model.name);
      setEditDescription(model.description);
      setEditIsPublic(model.isPublic || false);
      setEditModalOpen(true);
    }, 100);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingModel(null);
    setEditName("");
    setEditDescription("");
    setEditIsPublic(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "unknown";
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = getFileExtension(fileName);
    switch (extension) {
      case "glb":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "gltf":
        return "bg-green-100 text-green-800 border-green-200";
      case "usdz":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = getFileExtension(fileName);
    return (
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(
          fileName
        )} border`}
      >
        <FileText className="w-6 h-6" />
      </div>
    );
  };

  const getFileUrl = (fileId: string, download = false) => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const bucketId = process.env.NEXT_PUBLIC_BUCKET_ID;
    const downloadParam = download ? "?download=true" : "";
    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view${downloadParam}`;
  };

  const statsData = [
    {
      title: "Total Models",
      value: models.length,
    },
    {
      title: "GLB Files",
      value: models.filter((m) => getFileExtension(m.fileName) === "glb")
        .length,
    },
    {
      title: "GLTF Files",
      value: models.filter((m) => getFileExtension(m.fileName) === "gltf")
        .length,
    },
    {
      title: "USDZ Files",
      value: models.filter((m) => getFileExtension(m.fileName) === "usdz")
        .length,
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold truncate">
              3D Models
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Manage your uploaded 3D models
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Button
              onClick={() => {
                setSearchTerm("");
                fetchModels();
                toast.success("Model list refreshed");
              }}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={exportModelsData}
              disabled={exporting || models.length === 0}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export Data"}
            </Button>
            <Link href="/dashboard/upload" className="flex-1 sm:flex-none">
              <Button size="sm" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Model
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={`stat-skeleton-${index}`} />
              ))
            : statsData.map((stat, index) => (
                <Card key={`stat-${index}`}>
                  <CardContent className="p-4 lg:p-6">
                    <div className="text-xs lg:text-sm font-medium text-muted-foreground mb-2">
                      {stat.title}
                    </div>
                    <div className="text-xl lg:text-2xl font-bold">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterType === "all" ? "All Types" : filterType.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("glb")}>
                GLB Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("gltf")}>
                GLTF Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("usdz")}>
                USDZ Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Models List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <ModelRowSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-sm lg:text-base">
                {searchTerm || filterType !== "all"
                  ? "No models match your search criteria"
                  : "No models found. Upload your first 3D model to get started."}
              </div>
              {!searchTerm && filterType === "all" && (
                <Link href="/dashboard/upload">
                  <Button className="mt-4" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Model
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredModels.map((model) => {
              const modelId = getModelId(model);
              const isDeleting = deletingId === modelId;

              return (
                <Card
                  key={modelId}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {getFileIcon(model.fileName)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base lg:text-lg font-semibold truncate">
                              {model.name}
                            </h3>
                            <p className="text-xs lg:text-sm text-muted-foreground truncate">
                              {model.fileName} •{" "}
                              {formatFileSize(model.fileSize)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className={getFileTypeColor(model.fileName)}
                              variant="outline"
                            >
                              {getFileExtension(model.fileName).toUpperCase()}
                            </Badge>
                            {model.isPublic ? (
                              <Badge
                                variant="outline"
                                className="text-green-700 border-green-200"
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>

                        {model.description && (
                          <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                            {model.description}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-xs text-muted-foreground">
                            Uploaded{" "}
                            {format(new Date(model.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadModel(model)}
                              className="flex-1 sm:flex-none"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                            <DropdownMenu
                              open={dropdownOpen === modelId}
                              onOpenChange={(open) =>
                                setDropdownOpen(open ? modelId : null)
                              }
                            >
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreVertical className="w-4 h-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {}}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditModal(model)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => downloadModel(model)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Model
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {model.name}"? This action cannot be
                                        undone and will permanently remove the
                                        model from both the database and
                                        storage.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteModel(modelId)}
                                        disabled={isDeleting}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Edit Model Dialog - Improved accessibility and focus management */}
        <Dialog
          open={editModalOpen}
          onOpenChange={(open) => {
            if (!open && !updatingModel) {
              closeEditModal();
            }
          }}
        >
          <DialogContent
            className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto"
            onPointerDownOutside={(e) => {
              if (updatingModel) {
                e.preventDefault();
              }
            }}
            onEscapeKeyDown={(e) => {
              if (updatingModel) {
                e.preventDefault();
              }
            }}
            // Ensure proper focus management
            onOpenAutoFocus={(e) => {
              // Prevent autofocus if there are other modals open
              if (dropdownOpen) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Model</DialogTitle>
              <DialogDescription>
                Update your model details and visibility settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Model name"
                  disabled={updatingModel}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Model description"
                  className="resize-none"
                  disabled={updatingModel}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-public"
                  checked={editIsPublic}
                  onCheckedChange={setEditIsPublic}
                  disabled={updatingModel}
                />
                <Label
                  htmlFor="edit-public"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {editIsPublic ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {editIsPublic ? "Public" : "Private"}
                </Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={updateModel}
                  className="flex-1"
                  disabled={updatingModel}
                >
                  {updatingModel ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="flex-1"
                  disabled={updatingModel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
