"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { UploadCloud, Loader2, AlertCircle, Globe, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB chunks for Vercel compatibility

export default function ModelUpload() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  // File validation
  const validateFile = (selectedFile: File): string | null => {
    const allowedExtensions = ["glb", "usdz", "gltf"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
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

      // Calculate total chunks needed
      const chunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
      setTotalChunks(chunks);
    }
  };

  const uploadFile = async () => {
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
    setCurrentChunk(0);
    try {
      // Generate unique upload ID for chunked uploads
      const uploadId = `upload_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const chunks = Math.ceil(file.size / CHUNK_SIZE);

      console.log(
        `Starting upload: ${file.name} (${formatFileSize(
          file.size
        )}) in ${chunks} chunk(s)`
      );

      // Upload each chunk
      for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkFile = new File([chunk], file.name, { type: file.type });

        const formData = new FormData();
        formData.append("file", chunkFile);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("isPublic", "true"); // Always public as requested

        // Add chunking parameters
        if (chunks > 1) {
          formData.append("chunkIndex", chunkIndex.toString());
          formData.append("totalChunks", chunks.toString());
          formData.append("uploadId", uploadId);
        }

        console.log(`Uploading chunk ${chunkIndex + 1}/${chunks}`);
        setCurrentChunk(chunkIndex + 1);

        const response = await fetch("/api/models/upload", {
          method: "POST",
          body: formData,
        });

        // Get detailed error information
        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.error("Response is not JSON:", responseText);
          throw new Error(
            `Server returned non-JSON response: ${responseText.substring(
              0,
              200
            )}`
          );
        }

        if (!response.ok) {
          console.error("Server error details:", result);
          throw new Error(
            result.error ||
              `Failed to upload chunk ${chunkIndex + 1}: ${response.status} ${
                response.statusText
              }`
          );
        }

        // Update progress
        const progress = Math.round(((chunkIndex + 1) / chunks) * 100);
        setUploadProgress(progress);

        console.log(
          `Chunk ${chunkIndex + 1}/${chunks} uploaded successfully`,
          result
        );

        // If this was the last chunk and it's completed
        if (result.completed) {
          console.log("Upload completed successfully!", result);
          setUploadSuccess(true);

          // Reset form after success
          setTimeout(() => {
            resetForm();
            router.push("/dashboard/models");
          }, 3000);

          break;
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);

      // Add debug info for the error
      if (error instanceof Error) {
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName("");
    setDescription("");
    setUploadSuccess(false);
    setUploadProgress(0);
    setCurrentChunk(0);
    setTotalChunks(0);
    setUploadError("");
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
                  {formatFileSize(file.size)} •{" "}
                  {totalChunks > 1 ? `${totalChunks} chunks` : "Single upload"}
                </p>
                <p className="text-xs text-gray-500">
                  Type: {file.type} • Extension: .{file.name.split(".").pop()}
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

          {/* Public Notice */}
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-blue-50">
            <Globe className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-blue-900">Public Model</p>
              <p className="text-sm text-blue-700">
                All uploaded models are public and viewable by anyone. Only you
                can delete or edit your models.
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {totalChunks > 1
                    ? `Uploading chunk ${currentChunk}/${totalChunks}...`
                    : "Uploading..."}
                </span>
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
              {totalChunks > 1 && (
                <p className="text-xs text-muted-foreground text-center">
                  Uploading using 3MB chunks
                </p>
              )}
            </div>
          )}

          {/* Error Alert */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <strong>Upload Error:</strong> {uploadError}
                </div>
                <details className="mt-2"></details>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Model uploaded successfully! Redirecting to your models in 3
                seconds...
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={uploadFile}
            disabled={!file || !name.trim() || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {totalChunks > 1
                  ? `Uploading chunk ${currentChunk}/${totalChunks}... (${uploadProgress}%)`
                  : `Uploading... (${uploadProgress}%)`}
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Model
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
