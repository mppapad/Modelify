"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  BarChart3,
  Layers,
  HardDrive,
  Maximize,
  ArrowUpRight,
  Eye,
} from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Navbar component (simplified version)
function Navbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="font-bold text-xl">Modelify</div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Help
          </Button>
          <Button variant="ghost" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Data with values set as requested
  const data = {
    totalModels: 0,
    activeModels: 0,
    totalViews: "N/A",
    storageUsed: 0,
    storageLimit: 500,
    storagePercentage: 0,
  };

  return (
    <>
      {/* Main content */}
      <div className="relative min-h-screen bg-white">
        <main className="container mx-auto p-4 md:p-6 lg:p-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome! Here's an overview of your 3D models.
                  </p>
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-40 mt-4 md:mt-0" />
            ) : (
              <Button
                className="mt-4 md:mt-0 bg-black hover:bg-gray-800 text-white"
                onClick={() => (window.location.href = "/dashboard/upload")}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload New Model
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Models Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Models
                </CardTitle>
                {isLoading ? (
                  <Skeleton className="h-4 w-4 rounded-full" />
                ) : (
                  <Layers className="h-4 w-4 text-black" />
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{data.totalModels}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.activeModels} active models
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Storage Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                {isLoading ? (
                  <Skeleton className="h-4 w-4 rounded-full" />
                ) : (
                  <HardDrive className="h-4 w-4 text-black" />
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between mb-1">
                      <span className="text-2xl font-bold">
                        {data.storageUsed} MB
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {data.storageLimit} MB
                      </span>
                    </div>
                    <Progress
                      value={data.storagePercentage}
                      className="h-2 bg-gray-100"
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Views Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Views
                </CardTitle>
                {isLoading ? (
                  <Skeleton className="h-4 w-4 rounded-full" />
                ) : (
                  <Eye className="h-4 w-4 text-black" />
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{data.totalViews}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start uploading to track views
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Recent Models */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {/* Quick Actions Panel */}
            <Card className="relative overflow-hidden">
              <CardHeader className="relative">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </>
                ) : (
                  <>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks to manage your account
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="relative space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      className="w-full justify-start bg-black hover:bg-gray-800 text-white"
                      onClick={() =>
                        (window.location.href = "/dashboard/upload")
                      }
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload New Model
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        (window.location.href = "/dashboard/analytics")
                      }
                    >
                      <BarChart3 className="mr-2 h-5 w-5" />
                      View Analytics
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        (window.location.href = "/dashboard/models")
                      }
                    >
                      <Layers className="mr-2 h-5 w-5" />
                      Manage Models
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Models - Empty State */}
            <Card className="relative overflow-hidden">
              <CardHeader className="relative">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </>
                ) : (
                  <>
                    <CardTitle>Recent Models</CardTitle>
                    <CardDescription>
                      Your recently uploaded models
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="relative">
                {isLoading ? (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Layers className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No models yet
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Upload your first 3D model to get started
                    </p>
                    <Button
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white"
                      onClick={() =>
                        (window.location.href = "/dashboard/upload")
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Model
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
