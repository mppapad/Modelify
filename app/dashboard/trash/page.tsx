"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, RefreshCcw, RotateCcw, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
// Define the model type
interface DeletedModel {
  id: string;
  name: string;
  description: string;
  deletedAt: Date;
  expiresAt: Date;
  size: string;
  modelType: string;
}

export default function RecycleBinPage() {
  const router = useRouter();
  const [deletedModels, setDeletedModels] = useState<DeletedModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch deleted models
  useEffect(() => {
    const fetchDeletedModels = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API call
        // const response = await fetch('/api/models/deleted');
        // const data = await response.json();
        // setDeletedModels(data);

        // Mock data for development purposes
        setTimeout(() => {
          const mockData: DeletedModel[] = [
            {
              id: "model-001",
              name: "Text Classification Model",
              description: "BERT-based text classifier for sentiment analysis",
              deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
              size: "2.3 GB",
              modelType: "NLP",
            },
            {
              id: "model-002",
              name: "Image Recognition v2",
              description: "ConvNet for product recognition",
              deletedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
              expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
              size: "4.7 GB",
              modelType: "Computer Vision",
            },
            {
              id: "model-003",
              name: "Recommender System",
              description:
                "Collaborative filtering system for product recommendations",
              deletedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
              expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
              size: "1.8 GB",
              modelType: "Recommender",
            },
          ];
          setDeletedModels(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch deleted models:", error);
        toast({
          title: "Error",
          description: "Failed to load deleted models. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchDeletedModels();
  }, []);

  // Filter models based on search query
  const filteredModels = deletedModels.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.modelType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate days left until permanent deletion
  const getDaysRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle model restore
  const handleRestore = async (modelId: string) => {
    try {
      // Replace with your actual API call
      // await fetch(`/api/models/${modelId}/restore`, { method: 'POST' });

      // Mock successful restore
      setDeletedModels(deletedModels.filter((model) => model.id !== modelId));
      toast({
        title: "Success",
        description: "Model has been restored to your models list.",
      });

      // Optionally refresh the models dashboard
      // router.refresh();
    } catch (error) {
      console.error("Failed to restore model:", error);
      toast({
        title: "Error",
        description: "Failed to restore model. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle permanent deletion
  const handlePermanentDelete = async (modelId: string) => {
    try {
      // Replace with your actual API call
      // await fetch(`/api/models/${modelId}/permanent-delete`, { method: 'DELETE' });

      // Mock successful deletion
      setDeletedModels(deletedModels.filter((model) => model.id !== modelId));
      toast({
        title: "Success",
        description: "Model has been permanently deleted.",
      });
    } catch (error) {
      console.error("Failed to permanently delete model:", error);
      toast({
        title: "Error",
        description: "Failed to permanently delete model. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk restore
  const handleBulkRestore = async () => {
    try {
      // Replace with your actual API call
      // await Promise.all(selectedItems.map(id => fetch(`/api/models/${id}/restore`, { method: 'POST' })));

      // Mock successful bulk restore
      setDeletedModels(
        deletedModels.filter((model) => !selectedItems.includes(model.id))
      );
      toast({
        title: "Success",
        description: `${selectedItems.length} models have been restored.`,
      });
      setSelectedItems([]);

      // Optionally refresh the models dashboard
      // router.refresh();
    } catch (error) {
      console.error("Failed to bulk restore models:", error);
      toast({
        title: "Error",
        description: "Failed to restore some models. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk permanent deletion
  const handleBulkPermanentDelete = async () => {
    try {
      // Replace with your actual API call
      // await Promise.all(selectedItems.map(id => fetch(`/api/models/${id}/permanent-delete`, { method: 'DELETE' })));

      // Mock successful bulk deletion
      setDeletedModels(
        deletedModels.filter((model) => !selectedItems.includes(model.id))
      );
      toast({
        title: "Success",
        description: `${selectedItems.length} models have been permanently deleted.`,
      });
      setSelectedItems([]);
    } catch (error) {
      console.error("Failed to bulk delete models:", error);
      toast({
        title: "Error",
        description: "Failed to delete some models. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredModels.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredModels.map((model) => model.id));
    }
  };

  // Handle single item selection
  const handleSelectItem = (modelId: string) => {
    if (selectedItems.includes(modelId)) {
      setSelectedItems(selectedItems.filter((id) => id !== modelId));
    } else {
      setSelectedItems([...selectedItems, modelId]);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Recycling Bin
              </CardTitle>
              <CardDescription>
                Items in the recycling bin are automatically deleted after 30
                days.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/models")}
            >
              Back to Models
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deleted models..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {selectedItems.length > 0 && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <RotateCcw className="h-4 w-4" />
                        Restore ({selectedItems.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Restore Selected Models
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to restore{" "}
                          {selectedItems.length} selected model(s) to your
                          active models?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkRestore}>
                          Restore
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1">
                        <Trash2 className="h-4 w-4" />
                        Delete ({selectedItems.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Permanently Delete Models
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {selectedItems.length}{" "}
                          selected model(s). This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkPermanentDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Permanently Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All Types</DropdownMenuItem>
                  <DropdownMenuItem>NLP Models</DropdownMenuItem>
                  <DropdownMenuItem>Computer Vision</DropdownMenuItem>
                  <DropdownMenuItem>Recommender Systems</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="gap-1"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No deleted models</h3>
              <p className="text-muted-foreground mt-2">
                Models that you delete will appear here for 30 days before being
                permanently removed.
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={
                          selectedItems.length === filteredModels.length &&
                          filteredModels.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Model Type
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Size</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Deleted On
                    </TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => {
                    const daysRemaining = getDaysRemaining(model.expiresAt);
                    return (
                      <TableRow key={model.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedItems.includes(model.id)}
                            onChange={() => handleSelectItem(model.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground hidden md:block">
                            {model.description}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{model.modelType}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {model.size}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(model.deletedAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              daysRemaining < 7
                                ? "destructive"
                                : daysRemaining < 15
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {daysRemaining} days left
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestore(model.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">
                                Restore
                              </span>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:ml-2">
                                    Delete
                                  </span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Permanently Delete Model
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete
                                    "{model.name}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handlePermanentDelete(model.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Permanently Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
