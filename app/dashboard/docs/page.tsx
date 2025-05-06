"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  Copy,
  FileText,
  Info,
  Lightbulb,
  AlertTriangle,
  Upload,
  Trash2,
  Code,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface GuideCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  imageSrc: string;
}

export default function DocumentationPage() {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`import { Button } from "@/components/ui/button"

export function Component() {
  return <Button variant="outline">Click me</Button>
}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate loading for demo purposes
  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <Button onClick={toggleLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col space-y-1 px-4 pb-4">
                  <Button
                    variant="ghost"
                    className="justify-start font-medium"
                    asChild
                  >
                    <Link href="/dashboard/docs">
                      <FileText className="mr-2 h-4 w-4" />
                      Getting Started
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-primary font-medium"
                    asChild
                  >
                    <Link href="/dashboard/docs">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Models
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium"
                    asChild
                  >
                    <Link href="/dashboard/docs/delete-models">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Models
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium"
                    asChild
                  >
                    <Link href="/dashboard/docs/iframe-export">
                      <Code className="mr-2 h-4 w-4" />
                      Export as iFrame
                    </Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {isLoading ? (
              <LoadingDocumentation />
            ) : (
              <>
                {/* Main Documentation Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center">
                      <Upload className="mr-2 h-5 w-5" />
                      <CardTitle>Upload 3D Models</CardTitle>
                    </div>
                    <CardDescription>
                      Learn how to upload and manage your 3D models in the
                      platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Our platform supports various 3D model formats including
                      GLB, GLTF, and OBJ. Follow the guide below to upload your
                      models and start creating immersive experiences.
                    </p>

                    <Alert className="mb-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Supported Formats</AlertTitle>
                      <AlertDescription>
                        We recommend using GLB format for the best performance
                        and compatibility.
                      </AlertDescription>
                    </Alert>

                    <Tabs defaultValue="guide" className="mb-6">
                      <TabsList>
                        <TabsTrigger value="guide">
                          Step-by-Step Guide
                        </TabsTrigger>
                        <TabsTrigger value="api">API Reference</TabsTrigger>
                      </TabsList>
                      <TabsContent value="guide" className="mt-2 space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <div className="aspect-video relative bg-muted">
                            <Image
                              src="/placeholder.svg?height=400&width=800"
                              alt="Upload interface screenshot"
                              width={800}
                              height={400}
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-medium">Upload Interface</h3>
                            <p className="text-sm text-muted-foreground">
                              The upload interface allows you to drag and drop
                              files or browse your computer.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Upload Steps</h3>
                          <ol className="space-y-4">
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                1
                              </div>
                              <div>
                                <p className="font-medium">
                                  Navigate to the Models section
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Click on the "Models" tab in the main
                                  dashboard navigation.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                2
                              </div>
                              <div>
                                <p className="font-medium">
                                  Click "Upload Model" button
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Look for the upload button in the top-right
                                  corner of the models page.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                3
                              </div>
                              <div>
                                <p className="font-medium">
                                  Select or drag your 3D model file
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Choose a GLB, GLTF, or OBJ file from your
                                  computer.
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                4
                              </div>
                              <div>
                                <p className="font-medium">
                                  Add metadata and publish
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Fill in the name, description, and tags for
                                  your model, then click "Publish".
                                </p>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </TabsContent>
                      <TabsContent value="api" className="relative">
                        <div className="bg-slate-900 text-slate-100 p-4 rounded-md mt-2 font-mono text-sm">
                          <pre>{`// Upload a 3D model using the API
const uploadModel = async (file) => {
  const formData = new FormData();
  formData.append('model', file);
  
  const response = await fetch('/api/models/upload', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}`}</pre>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={handleCopy}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/docs">Getting Started</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/docs/delete-models">
                        Next: Delete Models
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Guide Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <GuideCard
                    icon={Trash2}
                    title="Deleting Models"
                    description="Learn how to remove models from your account"
                    imageSrc="/placeholder.svg?height=200&width=400"
                  />
                  <GuideCard
                    icon={Code}
                    title="Export as iFrame"
                    description="Embed your 3D models on any website"
                    imageSrc="/placeholder.svg?height=200&width=400"
                  />
                </div>

                {/* Best Practices */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                      <CardTitle>Best Practices</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>File Size Limitations</AlertTitle>
                        <AlertDescription>
                          Models larger than 50MB may cause performance issues.
                          Consider optimizing your models before uploading.
                        </AlertDescription>
                      </Alert>

                      <h4 className="font-medium text-lg">Optimization Tips</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Reduce polygon count for better performance</li>
                        <li>Compress textures to reduce file size</li>
                        <li>Remove unnecessary nodes and animations</li>
                        <li>Use draco compression for GLB/GLTF files</li>
                        <li>
                          Test your models on different devices before
                          publishing
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideCard({
  icon: Icon,
  title,
  description,
  imageSrc,
}: GuideCardProps) {
  // Determine the href based on the title
  const getHref = () => {
    if (title.includes("Delete")) return "/dashboard/docs/delete-models";
    if (title.includes("iFrame") || title.includes("Export"))
      return "/dashboard/docs/iframe-export";
    return "/dashboard/docs";
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          width={400}
          height={200}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader>
        <div className="flex items-center">
          <Icon className="mr-2 h-5 w-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          Follow our step-by-step guide to learn everything about this feature.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-between" asChild>
          <Link href={getHref()}>
            View Guide <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function LoadingDocumentation() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-full max-w-md mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          <div className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-full max-w-xs rounded-md" />
            <div className="p-4 space-y-4">
              <div className="aspect-video">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="aspect-video">
            <Skeleton className="h-full w-full" />
          </div>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>

        <Card>
          <div className="aspect-video">
            <Skeleton className="h-full w-full" />
          </div>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
