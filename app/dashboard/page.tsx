"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  BarChart3,
  Layers,
  HardDrive,
  ArrowUpRight,
  Eye,
  Calendar,
} from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface DashboardStats {
  totalModels: number;
  activeModels: number;
  totalViews: string;
  storageUsed: number;
  storageLimit: number;
  storagePercentage: number;
  recentModels: Array<{
    $id: string;
    name: string;
    description: string;
    createdAt: string;
    views: number;
    isPublic: boolean;
    fileId: string; // Add this field
  }>;
}

export default function DashboardPage() {
  // Change header
  useEffect(() => {
    document.title = "Modelify | Dashboard";
  }, []);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardStats>({
    totalModels: 0,
    activeModels: 0,
    totalViews: "0",
    storageUsed: 0,
    storageLimit: 500,
    storagePercentage: 0,
    recentModels: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const stats = await response.json();
        setData(stats);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Main content */}
      <div className="relative min-h-screen bg-background">
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
                className="mt-4 md:mt-0"
                onClick={() => (window.location.href = "/dashboard/upload")}
              >
                <Upload className=" h-5 w-5" />
                Upload
              </Button>
            )}
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <Card className="mb-8 border-destructive/20 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

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
                  <Layers className="h-4 w-4 text-muted-foreground" />
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
                      {data.activeModels} public models
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
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
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
                    <Progress value={data.storagePercentage} className="h-2" />
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
                  <Eye className="h-4 w-4 text-muted-foreground" />
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
                      {data.totalModels > 0
                        ? "Across all your models"
                        : "Start uploading to track views"}
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
                      className="w-full justify-start"
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

            {/* Recent Models */}
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
                ) : data.recentModels.length > 0 ? (
                  <div className="space-y-4 group">
                    {data.recentModels.map((model) => (
                      <div
                        key={model.$id}
                        className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() =>
                          window.open(`/view/${model.fileId}`, "_blank")
                        }
                      >
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          <Layers className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {model.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(model.createdAt)}</span>
                            <span>•</span>
                            <Eye className="h-3 w-3" />
                            <span>{model.views} views</span>
                            {model.isPublic && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">Public</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/dashboard/models/${model.$id}`;
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {data.totalModels > 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() =>
                          (window.location.href = "/dashboard/models")
                        }
                      >
                        View All Models
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">No models yet</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Upload your first 3D model to get started
                    </p>
                    <Button
                      size="sm"
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
