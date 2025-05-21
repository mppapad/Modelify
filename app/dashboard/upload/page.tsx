"use client";

import { useEffect, useState } from "react";
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

export default function UploadModelPage() {
  useEffect(() => {
    document.title = "Modelify | Upload";
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulate initial loading (like fetching permissions or user data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
          setTimeout(() => setUploading(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

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
                  Choose a 3D model file to upload. Supported formats: ".glb",
                  ".usdz".
                </CardDescription>
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
                  accept=".glb,.usdz"
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
                {uploading ? "Uploading..." : "Upload Model"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
