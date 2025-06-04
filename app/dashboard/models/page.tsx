"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  Download,
  FileText,
  Loader2,
  RefreshCcw,
  MessageCircleWarning,
  ExternalLink,
  Copy,
  MoreVertical,
  Edit,
  Code,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Model {
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
  views?: number;
  downloads?: number;
  lastViewedAt?: string;
  lastDownloadedAt?: string;
}

// Loading Skeleton with proper accessibility
const ModelRowSkeleton = () => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 bg-muted rounded-lg animate-pulse"
          aria-hidden="true"
        ></div>
        <div className="flex-1 space-y-2">
          <div
            className="h-4 bg-muted rounded animate-pulse w-48"
            aria-hidden="true"
          ></div>
          <div
            className="h-3 bg-muted rounded animate-pulse w-32"
            aria-hidden="true"
          ></div>
        </div>
        <div className="flex gap-2">
          <div
            className="h-8 bg-muted rounded animate-pulse w-20"
            aria-hidden="true"
          ></div>
          <div
            className="h-8 bg-muted rounded animate-pulse w-16"
            aria-hidden="true"
          ></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Improved edit state management
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [updatingModel, setUpdatingModel] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  // Edit modal
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Embed modal
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [embedModel, setEmbedModel] = useState<Model | null>(null);

  // Add this state near the other useState declarations
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Add error state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    const filtered = models.filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [models, searchTerm]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/models/my-models");

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      console.log("Fetched models data:", data);
      console.log("First model structure:", data);
      console.log("First model ID:", data.models?.[0]?.$id);

      setModels(data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError("Failed to fetch models");
      toast.error("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  // Generate file URL for downloading
  const getFileUrl = (fileId: string) => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
  };

  // Generate file URL for viewing/embedding (different from download)
  const getFileViewUrl = (fileId: string) => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
  };

  // Improved update model function
  const updateModel = async (
    modelId: string,
    updateData: {
      name?: string;
      description?: string;
      isPublic?: boolean;
    }
  ) => {
    try {
      setUpdatingModel(true);
      setError(null);

      console.log(`PATCH /api/models/update/${modelId}`);
      console.log("Update data:", updateData);

      // Ensure the modelId is properly encoded in the URL
      const encodedModelId = encodeURIComponent(modelId);

      const response = await fetch(`/api/models/update/${encodedModelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        // Add credentials to ensure cookies are sent
        credentials: "include",
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to update model");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      // Update the local state with the new data
      const updatedModelData = result.model || result;
      setModels((prevModels) =>
        prevModels.map((model) =>
          model.$id === modelId ? { ...model, ...updatedModelData } : model
        )
      );

      // Close the edit form
      closeEditModal();

      toast.success(result.message || "Model updated successfully.");

      return result;
    } catch (error) {
      console.error("Failed to update model:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update model"
      );

      // More specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Network error - please check your connection");
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update model. Please try again."
        );
      }
      throw error;
    } finally {
      setUpdatingModel(false);
    }
  };

  // Handler for the save button
  const handleSaveChanges = async () => {
    if (!editingModel) return;

    try {
      setError(null);
      // Only send non-empty values
      const updateData: any = {};

      if (editForm.name.trim()) {
        updateData.name = editForm.name.trim();
      }

      if (editForm.description.trim()) {
        updateData.description = editForm.description.trim();
      }

      // Always include isPublic as it's a boolean
      updateData.isPublic = editForm.isPublic;

      await updateModel(editingModel, updateData);
    } catch (error) {
      console.error("Update failed:", error);
      setError(error instanceof Error ? error.message : "Update failed");
    }
  };

  // Function to start editing a model
  const startEditing = (model: Model) => {
    setEditingModel(model.$id);
    setEditForm({
      name: model.name || "",
      description: model.description || "",
      isPublic: model.isPublic || false,
    });
    setEditDialogOpen(true);
  };

  const deleteModel = async (documentId: string) => {
    if (!documentId || documentId === "undefined") {
      console.error("Invalid document ID:", documentId);
      toast.error("Error: Invalid document ID");
      return;
    }

    console.log("Deleting model with document ID:", documentId);

    try {
      setDeletingId(documentId);
      setError(null);

      // Ensure the documentId is properly encoded in the URL
      const encodedDocumentId = encodeURIComponent(documentId);

      const response = await fetch(`/api/models/delete/${encodedDocumentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete model");
      }

      const result = await response.json();

      setModels((prev) => prev.filter((model) => model.$id !== documentId));
      toast.success(result.message || "Model deleted successfully.");
    } catch (error) {
      console.error("Error deleting model:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete model"
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete model. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = () => {
    if (modelToDelete) {
      deleteModel(modelToDelete.$id);
      closeDeleteDialog();
    }
  };

  // Improved download function with proper authentication - FIXED URL
  const downloadModel = async (model: Model) => {
    try {
      setDownloadingId(model.$id);
      setError(null);

      console.log("Starting download for model:", model.name);

      // Record download analytics BEFORE starting download
      console.log(
        "🔥 About to record download analytics for fileId:",
        model.fileId
      );
      try {
        const analyticsResponse = await fetch(
          `/api/models/record-download/${encodeURIComponent(model.fileId)}`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        console.log(
          "📊 Analytics API response status:",
          analyticsResponse.status
        );

        if (analyticsResponse.ok) {
          const analyticsResult = await analyticsResponse.json();
          console.log(
            "✅ Download analytics recorded successfully:",
            analyticsResult
          );
        } else {
          const errorData = await analyticsResponse
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("❌ Analytics API failed:", errorData);
        }
      } catch (analyticsError) {
        console.error(
          "❌ Failed to record download analytics:",
          analyticsError
        );
        // Don't fail the download if analytics fails
      }

      console.log("📥 Starting file download...");

      // Use the corrected API route (downloads plural)
      const response = await fetch(
        `/api/models/downloads/${encodeURIComponent(model.fileId)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Download failed" }));
        throw new Error(errorData.error || "Failed to download file");
      }

      // Get the blob from the response with proper type
      const blob = await response.blob();

      // Verify the blob has content
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }

      // Create a download link with proper MIME type
      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type: model.mimeType || "application/octet-stream",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = model.fileName;
      link.style.display = "none";

      // Add rel attribute for security
      link.rel = "noopener noreferrer";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Download started: ${model.fileName}`);

      // Refresh models to get updated download count
      fetchModels();
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download file");
      toast.error(
        error instanceof Error ? error.message : "Failed to download file"
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const copyFileUrl = async (model: Model) => {
    try {
      setCopyingId(model.$id);
      setError(null);
      const fileUrl = getFileViewUrl(model.fileId); // Use view URL for copying

      await navigator.clipboard.writeText(fileUrl);
      toast.success("File URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      setError("Failed to copy URL");
      toast.error("Failed to copy URL");
    } finally {
      setCopyingId(null);
    }
  };

  // Open model in new tab directly - Record view when opening
  const viewModel = async (model: Model) => {
    try {
      // Record view analytics when opening the model
      await fetch(
        `/api/models/record-view/${encodeURIComponent(model.fileId)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      // Refresh models to get updated view count
      fetchModels();
    } catch (analyticsError) {
      console.error("Failed to record view analytics:", analyticsError);
      // Don't fail the view if analytics fails
    }

    // Open the model in a new tab
    window.open(`/view/${model.fileId}`, "_blank");
  };

  // Modal handlers - updated to close dropdown first
  const openEditModal = (model: Model) => {
    setOpenDropdownId(null); // Close dropdown first
    setTimeout(() => {
      startEditing(model);
    }, 100); // Small delay to ensure dropdown closes
  };

  const closeEditModal = () => {
    setEditDialogOpen(false);
    setEditingModel(null);
    setEditForm({ name: "", description: "", isPublic: false });
  };

  const openDeleteDialog = (model: Model) => {
    setOpenDropdownId(null); // Close dropdown first
    setTimeout(() => {
      setModelToDelete(model);
      setDeleteDialogOpen(true);
    }, 100);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  const openEmbedModal = (model: Model) => {
    setOpenDropdownId(null); // Close dropdown first
    setTimeout(() => {
      setEmbedModel(model);
      setEmbedDialogOpen(true);
    }, 100);
  };

  const closeEmbedModal = () => {
    setEmbedDialogOpen(false);
    setEmbedModel(null);
  };

  const copyEmbedCode = async (embedCode: string) => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success("Embed code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy embed code");
    }
  };

  // Generate embed code
  const generateEmbedCode = (model: Model) => {
    // Use the view page URL for iframe embedding
    const viewUrl = `/view/${model.fileId}`;

    return `<iframe src="${viewUrl}" width="800" height="600" frameborder="0" title="${model.name}" allowfullscreen></iframe>`;
  };

  // Export all URLs as JSON
  const exportFileUrls = () => {
    const urlsData = models.map((model) => ({
      id: model.$id,
      name: model.name,
      fileName: model.fileName,
      fileUrl: getFileViewUrl(model.fileId), // Use view URL for export
      downloadUrl: getFileUrl(model.fileId), // Include both URLs
      createdAt: model.createdAt,
      views: model.views || 0,
      downloads: model.downloads || 0,
    }));

    const dataStr = JSON.stringify(urlsData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileName = `model-urls-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();

    toast.success("URLs exported successfully!");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "unknown";
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = getFileExtension(fileName);
    switch (extension) {
      case "glb":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "gltf":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "usdz":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  // Add this useEffect after the existing ones
  useEffect(() => {
    if (editDialogOpen || embedDialogOpen || deleteDialogOpen) {
      setOpenDropdownId(null);
    }
  }, [editDialogOpen, embedDialogOpen, deleteDialogOpen]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">3D Models</h1>
            <p className="text-muted-foreground">
              Download and manage your files
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={fetchModels}
              disabled={loading}
              variant="outline"
              size="sm"
              aria-label="Refresh models list"
              className="flex-1 sm:flex-none"
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline sm:ml-2">Refresh</span>
            </Button>
            <Button
              onClick={exportFileUrls}
              disabled={models.length === 0}
              variant="outline"
              size="sm"
              aria-label="Export all file URLs as JSON"
              className="flex-1 sm:flex-none"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline sm:ml-2">Export URLs</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Model Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Models
              </div>
              <div className="text-2xl font-bold">{models.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Views
              </div>
              <div className="text-2xl font-bold">
                {models.reduce((sum, model) => sum + (model.views || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </div>
              <div className="text-2xl font-bold">
                {models.reduce((sum, model) => sum + (model.downloads || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">
                GLB Files
              </div>
              <div className="text-2xl font-bold">
                {
                  models.filter((m) => getFileExtension(m.fileName) === "glb")
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search */}
      <div className="relative">
        <label htmlFor="search-models" className="sr-only">
          Search models
        </label>
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
          aria-hidden="true"
        />
        <Input
          id="search-models"
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      {/* Public Notice */}
      <div
        className="flex items-center gap-3 p-4 border rounded-lg bg-green-500/10 border-green-500/20"
        role="status"
        aria-live="polite"
      >
        <MessageCircleWarning
          className="h-5 w-5 text-green-500"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-green-800 dark:text-green-200">
            Analytics Active
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            Views and downloads are now being tracked! Check the Analytics page
            for detailed insights.
          </p>
        </div>
      </div>

      {/* Models List */}
      <main>
        <h2 className="sr-only">Models List</h2>
        <div className="space-y-4">
          {loading ? (
            <div role="status" aria-live="polite" aria-label="Loading models">
              {Array.from({ length: 3 }).map((_, index) => (
                <ModelRowSkeleton key={index} />
              ))}
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12" role="status">
              <div className="text-muted-foreground">
                {searchTerm ? "No models match your search" : "No models found"}
              </div>
            </div>
          ) : (
            filteredModels.map((model) => (
              <Card
                key={model.$id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    {/* File Icon - Updated with white icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary text-white"
                      aria-hidden="true"
                    >
                      <FileText className="w-6 h-6 stroke-black" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h3 className="font-semibold truncate">{model.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {model.fileName} • {formatFileSize(model.fileSize)}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>
                          <time dateTime={model.createdAt}>
                            {new Date(model.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </time>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {model.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {model.downloads || 0} downloads
                        </span>
                      </div>
                    </div>

                    {/* File Type Badge */}
                    <Badge className={getFileTypeColor(model.fileName)}>
                      {getFileExtension(model.fileName).toUpperCase()}
                    </Badge>

                    {/* Actions - Improved responsive layout */}
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyFileUrl(model)}
                        disabled={copyingId === model.$id}
                        aria-label={`Copy file URL for ${model.name}`}
                        className="flex-1 sm:flex-none"
                      >
                        {copyingId === model.$id ? (
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Copy className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span className="ml-2 sm:inline">Copy</span>
                      </Button>

                      {/* View Button - Now opens directly in new tab */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewModel(model)}
                        aria-label={`View ${model.name}`}
                        className="flex-1 sm:flex-none"
                      >
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        <span className="ml-2 sm:inline">View</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => downloadModel(model)}
                        disabled={downloadingId === model.$id}
                        aria-label={`Download ${model.name}`}
                        className="flex-1 sm:flex-none"
                      >
                        {downloadingId === model.$id ? (
                          <>
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              aria-hidden="true"
                            />
                            <span className="ml-2 sm:inline">
                              Downloading...
                            </span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" aria-hidden="true" />
                            <span className="ml-2 sm:inline">Download</span>
                          </>
                        )}
                      </Button>

                      {/* Three Dots Menu - Updated with controlled state */}
                      <DropdownMenu
                        open={openDropdownId === model.$id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenDropdownId(model.$id);
                          } else {
                            setOpenDropdownId(null);
                          }
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`More actions for ${model.name}`}
                          >
                            <MoreVertical
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              openEditModal(model);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              openEmbedModal(model);
                            }}
                          >
                            <Code className="w-4 h-4 mr-2" aria-hidden="true" />
                            Embed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              openDeleteDialog(model);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2
                              className="w-4 h-4 mr-2"
                              aria-hidden="true"
                            />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              model "{modelToDelete?.name}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deletingId === modelToDelete?.$id}
            >
              {deletingId === modelToDelete?.$id ? (
                <>
                  <Loader2
                    className="w-4 h-4 mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Model Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>
              Make changes to your model here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-public" className="text-right">
                Public
              </Label>
              <Switch
                id="edit-public"
                checked={editForm.isPublic}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, isPublic: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={updatingModel}>
              {updatingModel ? (
                <>
                  <Loader2
                    className="w-4 h-4 mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Modal - Fixed Responsive */}
      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
            <DialogDescription>
              Copy the iframe code below to embed this model in your website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {embedModel && (
              <div className="space-y-4">
                {/* Preview */}
                <div>
                  <Label className="text-sm font-medium">Preview:</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <iframe
                      src={`/view/${embedModel.fileId}`}
                      className="w-full h-64 border-0"
                      title={`Preview of ${embedModel.name}`}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Embed Code */}
                <div>
                  <Label htmlFor="embed-code" className="text-sm font-medium">
                    Embed Code:
                  </Label>
                  <div className="mt-2 p-3 bg-muted rounded-md max-h-[20vh] overflow-auto">
                    <code
                      id="embed-code"
                      className="text-xs sm:text-sm whitespace-pre-wrap break-all"
                      tabIndex={0}
                    >
                      {generateEmbedCode(embedModel)}
                    </code>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        copyEmbedCode(generateEmbedCode(embedModel))
                      }
                      aria-label="Copy embed code to clipboard"
                      className="flex-1 sm:flex-none"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline sm:ml-2">
                        Copy Code
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/view/${embedModel.fileId}`, "_blank")
                      }
                      className="flex-1 sm:flex-none"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline sm:ml-2">
                        Open Full
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEmbedModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
