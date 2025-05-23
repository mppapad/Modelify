import { NextRequest, NextResponse } from "next/server";
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    // Build queries
    const queries = [
      Query.equal("userId", appwriteUserId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    // Add search filter if provided
    if (search) {
      queries.push(Query.search("name", search));
    }

    // Query documents belonging to the current user
    const documents = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      queries
    );

    // Enhance models with file information
    const modelsWithFileInfo = await Promise.all(
      documents.documents.map(async (model) => {
        try {
          // Get file information
          const file = await storage.getFile(BUCKET_ID, model.fileId);

          // Generate file URL for download/preview
          const fileUrl = storage.getFileDownload(BUCKET_ID, model.fileId);

          return {
            ...model,
            fileSize: file.sizeOriginal || 0,
            fileSizeMB:
              Math.round(((file.sizeOriginal || 0) / (1024 * 1024)) * 100) /
              100,
            fileUrl: fileUrl.toString(),
            fileName: file.name,
            mimeType: file.mimeType,
            views: model.views || 0,
            createdAt: model.$createdAt,
            updatedAt: model.$updatedAt,
          };
        } catch (fileError) {
          console.error(
            `Error getting file info for model ${model.$id}:`,
            fileError
          );
          return {
            ...model,
            fileSize: 0,
            fileSizeMB: 0,
            fileUrl: null,
            fileName: "Unknown",
            mimeType: "Unknown",
            views: model.views || 0,
            createdAt: model.$createdAt,
            updatedAt: model.$updatedAt,
          };
        }
      })
    );

    return NextResponse.json({
      models: modelsWithFileInfo,
      total: documents.total,
      limit,
      offset,
      hasMore: offset + limit < documents.total,
    });
  } catch (error: any) {
    console.error("Error fetching user models:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch models" },
      { status: 500 }
    );
  }
}
