"use client";

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
import { Input } from "@/components/ui/input";
import { Code, Copy, Check, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function IframeExportPage() {
  const [copied, setCopied] = useState(false);
  const [modelId, setModelId] = useState("example-model-123");

  const iframeCode = `<iframe
  src="https://your-domain.com/embed/${modelId}"
  width="100%"
  height="500"
  style="border:none;"
  allow="autoplay; fullscreen; xr-spatial-tracking"
  loading="lazy">
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Code className="mr-2 h-5 w-5" />
              <CardTitle>Export as iFrame</CardTitle>
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

            <Tabs defaultValue="generate" className="mb-6">
              <TabsList>
                <TabsTrigger value="generate">Generate Embed Code</TabsTrigger>
                <TabsTrigger value="customize">Customize Embed</TabsTrigger>
              </TabsList>
              <TabsContent value="generate" className="mt-2 space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="iFrame export interface"
                      width={800}
                      height={400}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium">Export Interface</h3>
                    <p className="text-sm text-muted-foreground">
                      The export interface allows you to generate embed codes
                      for your 3D models.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
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
                          Find and click on the model you want to embed on your
                          website.
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Click "Share" or "Export"</p>
                        <p className="text-sm text-muted-foreground">
                          Look for the share button in the model viewer
                          interface.
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Select "Embed" option</p>
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
                    Copy this code and paste it into your website's HTML where
                    you want the 3D model to appear:
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
              </TabsContent>
              <TabsContent value="customize" className="mt-2 space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customize Your Embed</h3>
                  <p className="text-muted-foreground">
                    You can customize how your embedded 3D model appears and
                    behaves by adjusting these parameters:
                  </p>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="model-id" className="text-sm font-medium">
                        Model ID
                      </label>
                      <Input
                        id="model-id"
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        placeholder="Enter your model ID"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the unique identifier for your model
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Width & Height
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          defaultValue="100%"
                          placeholder="Width (e.g., 100%, 600px)"
                        />
                        <Input
                          defaultValue="500"
                          placeholder="Height (e.g., 500px)"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set the dimensions of your embedded viewer
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Additional Options
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="autoplay" defaultChecked />
                          <label htmlFor="autoplay" className="text-sm">
                            Autoplay animations
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="ar" defaultChecked />
                          <label htmlFor="ar" className="text-sm">
                            Enable AR view (if available)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="loading" defaultChecked />
                          <label htmlFor="loading" className="text-sm">
                            Lazy loading
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="controls" defaultChecked />
                          <label htmlFor="controls" className="text-sm">
                            Show controls
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden mt-4">
                  <div className="aspect-video relative bg-muted">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="Embedded 3D model preview"
                      width={800}
                      height={400}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium">Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      This is how your embedded 3D model will appear on your
                      website.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Testing Your Embed</AlertTitle>
              <AlertDescription>
                Always test your embedded 3D model on different devices and
                browsers to ensure it displays correctly.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Delete Models
            </Button>
            <Button variant="outline" size="sm">
              Next: Advanced Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
