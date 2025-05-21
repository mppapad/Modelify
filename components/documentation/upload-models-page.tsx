"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Code,
  Copy,
  Check,
  Info,
  ArrowLeft,
  ArrowRight,
  Upload,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function ModelsUploadPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          <Skeleton className="h-10 w-40" />

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-24 w-full" />

              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex">
                      <Skeleton className="h-7 w-7 rounded-full mr-3" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Link href="/dashboard/docs">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documentation
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              <CardTitle>Upload Models</CardTitle>
            </div>
            <CardDescription>
              Learn how to Upload your 3D models on Modelify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our platform makes it easy to upload your 3D models.
            </p>

            <Alert className="mb-6 border-amber-700">
              <Info className="h-4 w-4 stroke-amber-700" />
              <AlertTitle className="text-amber-700">
                Supported files
              </AlertTitle>
              <AlertDescription>
                Modelify only supports .glb and .usdz files, for the 3D models
              </AlertDescription>
            </Alert>

            <div className="mb-6">
              <div className="rounded-lg border overflow-hidden">
                <div className="relative bg-muted">
                  <Image
                    src="/upload.png"
                    alt="iFrame export interface"
                    width={1920}
                    height={1080}
                    quality={100}
                    priority
                    className="w-full h-auto"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-medium">Export Interface</h3>
                  <p className="text-sm text-muted-foreground">
                    The export interface allows you to generate embed codes for
                    your 3D models.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Steps to Upload a Model</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">
                        Navigate to the Upload section
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click on the "Choose file" field in the upload card
                        navigation.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">
                        Select the model from your device
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Find and click on the model you want to upload.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Click "Upload Model"</p>
                      <p className="text-sm text-muted-foreground">
                        Click on the Upload button in the upload interface.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Done</p>
                      <p className="text-sm text-muted-foreground">
                        Navigate to the models section to see your model on
                        Modelify.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Testing Your Model</AlertTitle>
              <AlertDescription>
                Always test your 3D model's and it's materials on different
                devices and browsers to ensure it displays correctly.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t pt-4">
            <Link href="/dashboard/docs">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous: Getting Started
              </Button>
            </Link>
            <Link href="/dashboard/docs/delete-models">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Next: Delete Models
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
