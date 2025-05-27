"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { UploadCloud, Loader2, AlertCircle, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function ModelUpload() {
  const { isAuthenticated, isSyncing, syncError, user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setUploadError(null);

    // Validate file type
    const allowedTypes = [".glb", ".usdz", ".gltf"];
    const fileExtension =
      "." + selectedFile.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.some((type) => fileExtension === type)) {
      setUploadError(
        "Please upload a valid 3D model file (.glb, .usdz, .gltf)"
      );
      return;
    }

    // Validate file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setUploadError("File size must be less than 100MB");
      return;
    }

    setFile(selectedFile);

    // Auto-populate fields
    if (!name) {
      setName(selectedFile.name.split(".")[0]);
    }
    if (!description) {
      setDescription(`3D model: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      setUploadError("Please select a file and provide a name");
      return;
    }

    if (!user) {
      setUploadError("User not authenticated");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadError(null);

    try {
      console.log("Starting upload process...");

      // Create FormData for direct upload to your existing API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("isPublic", isPublic.toString());

      // For chunked upload support (optional)
      formData.append("chunkIndex", "0");
      formData.append("totalChunks", "1");

      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error("Invalid response format"));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || `HTTP ${xhr.status}`));
            } catch (e) {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        // Use your existing API endpoint that expects multipart/form-data
        xhr.open("POST", "/api/models/upload");
        xhr.send(formData);
      });

      const uploadResult = await uploadPromise;
      console.log("Upload successful:", uploadResult);

      setProgress(100);

      // Reset form after successful upload
      setTimeout(() => {
        setFile(null);
        setName("");
        setDescription("");
        setIsPublic(false);
        setProgress(0);
        setIsUploading(false);
        setUploadError(null);
        alert("Model uploaded successfully!");
      }, 1000);
    } catch (error: any) {
      console.error("Error uploading model:", error);
      setProgress(0);
      setIsUploading(false);

      let errorMessage = "Failed to upload model";
      if (error.message) {
        if (
          error.message.includes("authorized") ||
          error.message.includes("401")
        ) {
          errorMessage =
            "Authentication error. Please try logging out and back in.";
        } else if (
          error.message.includes("413") ||
          error.message.includes("too large")
        ) {
          errorMessage = "File too large. Maximum size is 100MB.";
        } else if (error.message.includes("400")) {
          errorMessage = "Invalid file format or corrupt file.";
        } else if (error.message.includes("403")) {
          errorMessage = "Permission denied. Check your account permissions.";
        } else {
          errorMessage = error.message;
        }
      }

      setUploadError(errorMessage);
    }
  };

  // Show sync error if there's one
  if (syncError) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium">
                  Authentication Sync Error
                </p>
                <p className="text-red-600 text-sm mt-2">{syncError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading while syncing
  if (isSyncing) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Syncing authentication...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-500">
                  Please log in to upload 3D models
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            {loading ? (
              <>
                <Skeleton className="h-8 w-52 mb-2" />
                <Skeleton className="h-4 w-72" />
              </>
            ) : (
              <>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UploadCloud className="w-6 h-6" />
                  Upload New Model
                </CardTitle>
                <CardDescription>
                  Upload your 3D model files up to 100MB directly to secure
                  storage. Supported formats: .glb, .usdz, .gltf
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-40" />
              </>
            ) : isUploading ? (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Uploading: <strong>{file?.name}</strong>
                  </p>
                  <Progress value={progress} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress < 100 ? `${progress}% uploaded` : "Complete!"}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* File Upload Area */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload">3D Model File</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".glb,.usdz,.gltf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {file
                          ? file.name
                          : "Drop your model here, or click to browse"}
                      </p>
                      <p className="text-xs text-gray-500">
                        GLB, USDZ, GLTF files up to 100MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-name">Model Name *</Label>
                    <Input
                      id="model-name"
                      type="text"
                      placeholder="Enter model name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-description">Description</Label>
                    <Textarea
                      id="model-description"
                      placeholder="Describe your 3D model (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Public/Private Toggle */}
                  <div className="flex items-center space-x-2 p-4 rounded-lg border bg-gray-50">
                    <Checkbox
                      id="is-public"
                      checked={isPublic}
                      onCheckedChange={(checked) =>
                        setIsPublic(checked as boolean)
                      }
                    />
                    <div className="flex items-center space-x-2">
                      {isPublic ? (
                        <Globe className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-600" />
                      )}
                      <Label
                        htmlFor="is-public"
                        className="text-sm font-medium"
                      >
                        {isPublic ? "Public" : "Private"}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-2">
                      {isPublic
                        ? "Anyone can view this model"
                        : "Only you can view this model"}
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {uploadError && (
                  <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {uploadError}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-end">
            {loading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <Button
                className="bg-black hover:bg-gray-800 text-white"
                onClick={handleUpload}
                disabled={!file || !name.trim() || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Model"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
