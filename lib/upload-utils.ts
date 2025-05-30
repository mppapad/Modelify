import { v4 as uuidv4 } from "uuid";

const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB chunks

export interface UploadProgress {
  progress: number;
  stage: "preparing" | "uploading" | "processing" | "complete" | "error";
  message: string;
  chunkProgress?: {
    current: number;
    total: number;
  };
}

export interface UploadOptions {
  file: File;
  name: string;
  description?: string;
  isPublic?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

export class ModelUploader {
  private onProgress?: (progress: UploadProgress) => void;

  constructor(onProgress?: (progress: UploadProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(progress: UploadProgress) {
    this.onProgress?.(progress);
  }

  async uploadModel(options: UploadOptions) {
    const { file, name, description = "", isPublic = false } = options;

    try {
      this.updateProgress({
        progress: 0,
        stage: "preparing",
        message: "Preparing upload...",
      });

      // Validate file
      const allowedExtensions = ["glb", "usdz"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new Error(
          "Invalid file type. Only GLB and USDZ files are allowed."
        );
      }

      // Check if chunking is needed
      if (file.size <= CHUNK_SIZE) {
        return await this.uploadSingleFile({
          file,
          name,
          description,
          isPublic,
        });
      } else {
        return await this.uploadChunkedFile({
          file,
          name,
          description,
          isPublic,
        });
      }
    } catch (error) {
      this.updateProgress({
        progress: 0,
        stage: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      });
      throw error;
    }
  }

  private async uploadSingleFile({
    file,
    name,
    description,
    isPublic,
  }: {
    file: File;
    name: string;
    description: string;
    isPublic: boolean;
  }) {
    this.updateProgress({
      progress: 10,
      stage: "uploading",
      message: "Uploading file...",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("isPublic", isPublic.toString());

    const response = await fetch("/api/models/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    this.updateProgress({
      progress: 100,
      stage: "complete",
      message: "Upload complete!",
    });

    return await response.json();
  }

  private async uploadChunkedFile({
    file,
    name,
    description,
    isPublic,
  }: {
    file: File;
    name: string;
    description: string;
    isPublic: boolean;
  }) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = uuidv4();

    this.updateProgress({
      progress: 5,
      stage: "uploading",
      message: `Uploading large file in ${totalChunks} chunks...`,
      chunkProgress: { current: 0, total: totalChunks },
    });

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const chunkFile = new File([chunk], `${file.name}_chunk_${chunkIndex}`, {
        type: file.type,
      });

      const formData = new FormData();
      formData.append("file", chunkFile);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("isPublic", isPublic.toString());
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("uploadId", uploadId);

      const response = await fetch("/api/models/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to upload chunk ${chunkIndex + 1}`
        );
      }

      const result = await response.json();

      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 90) + 5;

      this.updateProgress({
        progress,
        stage: chunkIndex === totalChunks - 1 ? "processing" : "uploading",
        message:
          chunkIndex === totalChunks - 1
            ? "Processing uploaded chunks..."
            : `Uploading chunk ${chunkIndex + 1} of ${totalChunks}...`,
        chunkProgress: { current: chunkIndex + 1, total: totalChunks },
      });

      if (result.completed) {
        this.updateProgress({
          progress: 100,
          stage: "complete",
          message: "Upload complete!",
        });
        return result;
      }

      // Small delay between chunks to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

// React hook for uploads
import { useState, useCallback } from "react";

export function useModelUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const uploadModel = useCallback(async (options: UploadOptions) => {
    setIsUploading(true);
    setProgress({
      progress: 0,
      stage: "preparing",
      message: "Starting upload...",
    });

    try {
      const uploader = new ModelUploader(setProgress);
      const result = await uploader.uploadModel(options);
      return result;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    uploadModel,
    isUploading,
    progress,
    resetProgress,
  };
}
