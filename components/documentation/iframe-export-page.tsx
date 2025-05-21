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
import { Code, Copy, Check, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function IframeExportPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modelId, setModelId] = useState("example-model-123");

  const iframeCode = `<iframe
  src="https://your-domain.com/embed/${modelId}"
  width="100%"
  height="500"
  style="border:none;"
  allow="autoplay; fullscreen; xr-spatial-tracking"
  loading="lazy">
</iframe>`;

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <Code className="mr-2 h-5 w-5" />
              <CardTitle>Embed Models</CardTitle>
            </div>
            <CardDescription>
              Learn how to embed your 3D models on any website using iFrames
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our platform makes it easy to share your 3D models on any website
              by generating an iframe embed code. This allows your visitors to
              interact with your 3D models directly on your website.
            </p>

            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Embedding Benefits</AlertTitle>
              <AlertDescription>
                Embedded 3D models load directly from our servers, ensuring
                optimal performance and the latest version of your model.
              </AlertDescription>
            </Alert>

            <div className="mb-6">
              <div className="rounded-lg border overflow-hidden">
                <div className="relative bg-muted">
                  <Image
                    src="/iframe.png"
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
                <h3 className="text-lg font-medium">
                  Steps to Generate an iFrame Embed
                </h3>
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
                        Click on the "Models" tab in the main dashboard
                        navigation.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Select the model to embed</p>
                      <p className="text-sm text-muted-foreground">
                        Find and click on the three dots of the model you want
                        to embed on your website.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Click "Export"</p>
                      <p className="text-sm text-muted-foreground">
                        Click on the Export button in the model viewer
                        interface.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="font-medium">
                        Select "Get Embed Code" option
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Choose the embed option from the sharing menu.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                      5
                    </div>
                    <div>
                      <p className="font-medium">Copy the generated code</p>
                      <p className="text-sm text-muted-foreground">
                        Click the copy button to copy the iframe code to your
                        clipboard.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="text-lg font-medium">Your Embed Code</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy this code and paste it into your website's HTML where you
                  want the 3D model to appear:
                </p>

                <div className="relative">
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{iframeCode}</pre>
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
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Testing Your Embed</AlertTitle>
              <AlertDescription>
                Always test your embedded 3D model on different devices and
                browsers to ensure it displays correctly.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t pt-4">
            <Link href="/dashboard/docs/delete-models">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous: Delete Models
              </Button>
            </Link>
            <Link href="/dashboard/docs">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Next: Getting Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
