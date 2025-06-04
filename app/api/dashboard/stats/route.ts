import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  databases,
  storage,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
  BUCKET_ID,
} from "@/lib/appwrite-server";
import { createAppwriteUserId } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);

    // Get user's models
    const modelsResponse = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("userId", appwriteUserId), Query.orderDesc("$createdAt")]
    );

    const models = modelsResponse.documents;

    // Calculate stats
    const totalModels = models.length;
    const activeModels = models.filter((model) => model.isPublic).length;

    // Calculate total views (sum of all model views)
    const totalViews = models.reduce(
      (sum, model) => sum + (model.views || 0),
      0
    );

    // Calculate storage usage
    let totalStorageUsed = 0;
    const storagePromises = models.map(async (model) => {
      try {
        const file = await storage.getFile(BUCKET_ID, model.fileId);
        return file.sizeOriginal || 0;
      } catch (error) {
        console.error(`Error getting file size for ${model.fileId}:`, error);
        return 0;
      }
    });

    const fileSizes = await Promise.all(storagePromises);
    totalStorageUsed = fileSizes.reduce((sum, size) => sum + size, 0);

    // Convert bytes to MB
    const storageUsedMB =
      Math.round((totalStorageUsed / (1024 * 1024)) * 100) / 100;
    const storageLimit = 500; // MB - adjust based on your limit
    const storagePercentage = Math.min(
      (storageUsedMB / storageLimit) * 100,
      100
    );

    // Get recent models (last 5) - FIXED: Added fileId
    const recentModels = models.slice(0, 5).map((model) => ({
      $id: model.$id,
      name: model.name,
      description: model.description,
      createdAt: model.$createdAt,
      views: model.views || 0,
      isPublic: model.isPublic || false,
      fileId: model.fileId, // ← This was missing!
    }));

    return NextResponse.json({
      totalModels,
      activeModels,
      totalViews: totalViews > 0 ? totalViews.toLocaleString() : "0",
      storageUsed: storageUsedMB,
      storageLimit,
      storagePercentage: Math.round(storagePercentage),
      recentModels,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
