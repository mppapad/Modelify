"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { UploadCloud, Loader2, AlertCircle, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function ModelUpload() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // File validation
  const validateFile = (selectedFile: File): string | null => {
    const allowedTypes = [".glb", ".usdz", ".gltf"];
    const fileExtension =
      "." + selectedFile.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.some((type) => fileExtension === type)) {
      return "Invalid file type. Please upload .glb, .usdz, or .gltf files only.";
    }

    // Check file size (100MB limit)
    if (selectedFile.size > 100 * 1024 * 1024) {
      return "File size exceeds 100MB limit.";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        setUploadError(error);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setUploadError("");

      // Auto-generate name from filename if empty
      if (!name.trim()) {
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(baseName);
      }
    }
  };

  // Server-side upload with progress simulation
  const handleServerUpload = async () => {
    if (!file || !name.trim()) {
      setUploadError("Please select a file and provide a name");
      return;
    }

    if (!user) {
      setUploadError("User not authenticated");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("isPublic", isPublic.toString());

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);

      console.log("Starting server-side upload...");

      // Upload to server (which handles Appwrite upload)
      const response = await fetch("/api/models/upload-large", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      setUploadSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFile(null);
        setName("");
        setDescription("");
        setIsPublic(false);
        setUploadSuccess(false);
        setUploadProgress(0);

        // Redirect to models page
        router.push("/dashboard/models");
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("413") ||
          error.message.includes("file_size_exceeded")
        ) {
          setUploadError("File size exceeds the maximum allowed limit.");
        } else if (error.message.includes("storage_file_type_unsupported")) {
          setUploadError(
            "File type not supported. Please upload .glb, .usdz, or .gltf files only."
          );
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          setUploadError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setUploadError(`Upload failed: ${error.message}`);
        }
      } else {
        setUploadError("An unexpected error occurred during upload.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-6 w-6" />
            Upload 3D Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Select Model File</Label>
            <Input
              id="file"
              type="file"
              accept=".glb,.usdz,.gltf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: .glb, .usdz, .gltf (Max: 100MB)
            </p>
            {file && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            )}
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Model Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter model name"
              disabled={isUploading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your 3D model..."
              disabled={isUploading}
              rows={3}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-blue-500" />
              ) : (
                <Lock className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium">
                  {isPublic ? "Public Model" : "Private Model"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Anyone can view this model"
                    : "Only you can view this model"}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Model uploaded successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleServerUpload}
            disabled={!file || !name.trim() || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading... ({uploadProgress}%)
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Model
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <p>✅ Server-side upload with authentication</p>
            <p>✅ Supports large files up to 100MB</p>
            <p>✅ Handles Vercel deployment automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
