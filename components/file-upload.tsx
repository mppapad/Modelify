"use client";

import { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface FileUploadProps {
  title?: string;
  description?: string;
  acceptedFormats?: string;
  onUploadComplete?: (file: File) => void;
  loading?: boolean;
}

export default function FileUpload({
  title = "Upload File",
  description = "Choose a file to upload.",
  acceptedFormats = ".glb,.usdz",
  onUploadComplete,
  loading = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            if (onUploadComplete) onUploadComplete(file);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
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
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : uploading ? (
          <>
            <p className="text-sm text-muted-foreground">
              Uploading: <strong>{file?.name}</strong>
            </p>
            <Progress value={progress} className="h-2 bg-gray-100" />
          </>
        ) : (
          <>
            <Input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileChange}
            />
            {file && (
              <div className="text-sm text-gray-700">
                Selected file: <strong>{file.name}</strong>
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
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
