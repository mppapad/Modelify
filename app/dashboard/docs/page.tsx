"use client";

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
  PlayCircle,
  Book,
  Settings,
} from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuickStartCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export default function DocumentationPage() {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Simulate initial loading and handle refresh
  useEffect(() => {
    // Set loading state to true on initial load
    setIsLoading(true);

    // Simulate network delay/data fetching
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Listen for route changes
    const handleRouteChange = () => {
      setIsLoading(true);
    };

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1500);
    };

    // Set up event listeners for browser navigation
    window.addEventListener("popstate", handlePopState);

    // Cleanup function
    return () => {
      clearTimeout(loadingTimer);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Additional function for manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`import { Button } from "@/components/ui/button"

export function Component() {
  return <Button variant="outline">Get Started</Button>
}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
          <Button onClick={handleRefresh}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col space-y-1 px-4 pb-4">
                  <Button
                    variant="ghost"
                    className="justify-start text-primary font-medium"
                    asChild
                  >
                    <Link href="/dashboard/docs">
                      <FileText className="mr-2 h-4 w-4" />
                      Getting Started
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-medium"
                    asChild
                  >
                    <Link href="/dashboard/docs/upload-models">
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
          <div className="lg:col-span-3 order-1 lg:order-2">
            {isLoading ? (
              <LoadingDocumentation />
            ) : (
              <>
                {/* Main Documentation Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      <CardTitle>Welcome to the Platform</CardTitle>
                    </div>
                    <CardDescription>
                      Your guide to getting started with our 3D model platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      This platform allows you to upload, manage, and showcase
                      3D models. Whether you're an artist, designer, or
                      developer, our tools help you bring your creations to
                      life.
                    </p>

                    <Alert className="mb-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Quick Tip</AlertTitle>
                      <AlertDescription>
                        Complete your profile to unlock all features and
                        personalize your experience.
                      </AlertDescription>
                    </Alert>

                    <Tabs defaultValue="overview" className="mb-6">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="quickstart">Quickstart</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="mt-2 space-y-4">
                        <div className="mb-6">
                          <div className="rounded-lg border overflow-hidden">
                            <div className="relative bg-muted">
                              <Image
                                src="/dashboard.png"
                                alt="Dashboard interface"
                                width={1920}
                                height={1080}
                                quality={100}
                                priority
                                className="w-full h-auto"
                              />
                            </div>
                            <div className="p-4 space-y-2">
                              <h3 className="font-medium">
                                Platform Dashboard
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Your dashboard gives you a comprehensive
                                overview of your models, analytics, and account
                                information.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Core Features</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">Model Management</p>
                                <p className="text-sm text-muted-foreground">
                                  Upload, organize, and manage your 3D models in
                                  one place
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Interactive Preview
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  View and interact with your 3D models in
                                  real-time
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Sharing & Embedding
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Share your models or embed them on your
                                  website
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Analytics & Insights
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Track views, interactions, and performance of
                                  your models
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="quickstart"
                        className="mt-2 space-y-4"
                      >
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Get Started in Minutes
                          </h3>
                          <ol className="space-y-4">
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                1
                              </div>
                              <div>
                                <p className="font-medium">
                                  Complete your profile
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Add your information and preferences in the
                                  account settings
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                2
                              </div>
                              <div>
                                <p className="font-medium">
                                  Upload your first model
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Go to the Models tab and click the "Upload
                                  Model" button
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                3
                              </div>
                              <div>
                                <p className="font-medium">
                                  Customize your model settings
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Adjust lighting, background, and controls for
                                  the best presentation
                                </p>
                              </div>
                            </li>
                            <li className="flex">
                              <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                4
                              </div>
                              <div>
                                <p className="font-medium">
                                  Share or embed your model
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Generate a shareable link or embed code for
                                  your website
                                </p>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/docs/upload-models">
                        Next: Upload Models
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Quick Start Guide Cards */}
                <h2 className="text-xl font-semibold mb-4">
                  Quick Start Guides
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <QuickStartCard
                    icon={Upload}
                    title="Upload Models"
                    description="Learn how to upload 3D models to your account"
                    href="/dashboard/docs/upload-models"
                  />
                  <QuickStartCard
                    icon={Trash2}
                    title="Delete Models"
                    description="Delete your models"
                    href="/dashboard/docs/delete-models"
                  />
                  <QuickStartCard
                    icon={Code}
                    title="Embed Models"
                    description="Add models to your website or app"
                    href="/dashboard/docs/iframe-export"
                  />
                </div>

                {/* Resources Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                      <CardTitle>Learning Resources</CardTitle>
                    </div>
                    <CardDescription>
                      Access tutorials and documentation to help you get the
                      most out of the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Book className="h-4 w-4 mr-2 text-primary" />
                            <CardTitle className="text-base">
                              Tutorials
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">
                            Step-by-step guides to help you master the platform
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="w-full justify-between"
                          >
                            View Tutorials{" "}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <PlayCircle className="h-4 w-4 mr-2 text-primary" />
                            <CardTitle className="text-base">
                              Video Guides
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">
                            Watch tutorials to learn how to use the platform
                            effectively
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            disabled
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between"
                          >
                            Watch Videos{" "}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardFooter>
                      </Card>
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

function QuickStartCard({
  icon: Icon,
  title,
  description,
  href,
}: QuickStartCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Icon className="mr-2 h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-between" asChild>
          <Link href={href}>
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
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-full max-w-md mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="space-y-4">
            <div className="border-b">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden">
                <div className="aspect-video">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>

              <div className="space-y-3">
                <Skeleton className="h-6 w-36" />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </CardFooter>
      </Card>

      <Skeleton className="h-8 w-48 mb-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Learning Resources Section Loading Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-full max-w-md mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-dashed">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </CardContent>
                <CardFooter className="pt-0">
                  <Skeleton className="h-8 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
