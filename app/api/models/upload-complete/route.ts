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

export async function PUT(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { documentId, fileId, success } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing document ID" },
        { status: 400 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);

    if (success) {
      // Update document status to completed
      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        documentId,
        {
          status: "completed",
          updatedAt: new Date().toISOString(),
        }
      );

      return NextResponse.json({
        success: true,
        document: updatedDocument,
      });
    } else {
      // Upload failed, clean up
      try {
        // Delete the incomplete document
        await databases.deleteDocument(
          DATABASE_ID,
          MODELS_COLLECTION_ID,
          documentId
        );

        // Try to delete the file if it was created
        if (fileId) {
          try {
            await storage.deleteFile(BUCKET_ID, fileId);
          } catch (deleteError) {
            console.warn("Could not delete file:", deleteError);
          }
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      return NextResponse.json({
        success: false,
        message: "Upload failed and resources cleaned up",
      });
    }
  } catch (error: any) {
    console.error("Error completing upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete upload" },
      { status: 500 }
    );
  }
}
