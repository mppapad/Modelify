"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
}

// Loading Skeleton
const ModelRowSkeleton = () => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function SimpleModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingModel, setUpdatingModel] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  // Edit modal
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);

  // Embed modal
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [embedModel, setEmbedModel] = useState<Model | null>(null);

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
      const response = await fetch("/api/models/my-models");

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  // Generate file URL
  const getFileUrl = (fileId: string) => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}&mode=admin`;
  };

  // Helper function to get model ID
  const getModelId = (model: Model) => model.$id;

  // Download file function
  const downloadModel = async (model: Model) => {
    try {
      setDownloadingId(model.$id);

      const fileUrl = getFileUrl(model.fileId);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = model.fileName;
      link.target = "_blank";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  // Copy URL to clipboard
  const copyFileUrl = async (model: Model) => {
    try {
      setCopyingId(model.$id);
      const fileUrl = getFileUrl(model.fileId);

      await navigator.clipboard.writeText(fileUrl);
      toast.success("File URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    } finally {
      setCopyingId(null);
    }
  };

  // Delete model function
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

  // Update model function
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

  // Modal handlers
  const openEditModal = (model: Model) => {
    setEditingModel(model);
    setEditName(model.name);
    setEditDescription(model.description || "");
    setEditIsPublic(model.isPublic || false);
    setEditDialogOpen(true);
  };

  const closeEditModal = () => {
    setEditDialogOpen(false);
    setEditingModel(null);
    setEditName("");
    setEditDescription("");
    setEditIsPublic(false);
  };

  const openDeleteDialog = (model: Model) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  const confirmDelete = () => {
    if (modelToDelete) {
      deleteModel(getModelId(modelToDelete));
      closeDeleteDialog();
    }
  };

  const openEmbedModal = (model: Model) => {
    setEmbedModel(model);
    setEmbedDialogOpen(true);
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
    const fileUrl = getFileUrl(model.fileId);
    const extension = getFileExtension(model.fileName);

    if (extension === "glb" || extension === "gltf") {
      return `<model-viewer src="${fileUrl}" alt="${model.name}" auto-rotate camera-controls></model-viewer>
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>`;
    } else {
      return `<!-- Embed code for ${extension.toUpperCase()} files -->
<iframe src="${fileUrl}" width="800" height="600" frameborder="0"></iframe>`;
    }
  };

  // Export all URLs as JSON
  const exportFileUrls = () => {
    const urlsData = models.map((model) => ({
      id: model.$id,
      name: model.name,
      fileName: model.fileName,
      fileUrl: getFileUrl(model.fileId),
      createdAt: model.createdAt,
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "unknown";
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = getFileExtension(fileName);
    switch (extension) {
      case "glb":
        return "bg-blue-100 text-blue-800";
      case "gltf":
        return "bg-green-100 text-green-800";
      case "usdz":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">3D Models</h1>
          <p className="text-muted-foreground">
            Download and manage your files
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchModels}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportFileUrls}
            disabled={models.length === 0}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Export URLs
          </Button>
        </div>
      </div>

      {/* Stats */}
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
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              GLTF Files
            </div>
            <div className="text-2xl font-bold">
              {
                models.filter((m) => getFileExtension(m.fileName) === "gltf")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">
              USDZ Files
            </div>
            <div className="text-2xl font-bold">
              {
                models.filter((m) => getFileExtension(m.fileName) === "usdz")
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>
      {/* Public Notice */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50">
        <MessageCircleWarning className="h-5 w-5 text-red-800" />
        <div>
          <p className="font-medium text-red-800 ">Warning</p>
          <p className="text-sm text-red-700 ">
            Edit, embed options are broken, DO NOT USE!
          </p>
        </div>
      </div>
      {/* Models List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ModelRowSkeleton key={index} />
          ))
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchTerm ? "No models match your search" : "No models found"}
            </div>
          </div>
        ) : (
          filteredModels.map((model) => (
            <Card key={model.$id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(
                      model.fileName
                    )}`}
                  >
                    <FileText className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{model.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {model.fileName} • {formatFileSize(model.fileSize)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(model.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>

                  {/* File Type Badge */}
                  <Badge className={getFileTypeColor(model.fileName)}>
                    {getFileExtension(model.fileName).toUpperCase()}
                  </Badge>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyFileUrl(model)}
                      disabled={copyingId === model.$id}
                    >
                      {copyingId === model.$id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => downloadModel(model)}
                      disabled={downloadingId === model.$id}
                    >
                      {downloadingId === model.$id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>

                    {/* Three Dots Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(model)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEmbedModal(model)}>
                          <Code className="w-4 h-4 mr-2" />
                          Embed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(model)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingId === modelToDelete?.$id}
            >
              {deletingId === modelToDelete?.$id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="public" className="text-right">
                Public
              </Label>
              <Switch
                id="public"
                checked={editIsPublic}
                onCheckedChange={setEditIsPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={updateModel} disabled={updatingModel}>
              {updatingModel ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
            <DialogDescription>
              Copy this code to embed your 3D model on your website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {embedModel && (
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{generateEmbedCode(embedModel)}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyEmbedCode(generateEmbedCode(embedModel))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeEmbedModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
