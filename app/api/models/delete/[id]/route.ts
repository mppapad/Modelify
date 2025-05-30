import { NextRequest, NextResponse } from "next/server";
import {
  databases,
  storage,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
  BUCKET_ID,
} from "@/lib/appwrite-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params since it's a Promise
  const resolvedParams = await params;

  console.log("=== DELETE REQUEST DEBUG ===");
  console.log("params:", resolvedParams);
  console.log("params.id:", resolvedParams.id);
  console.log("typeof params.id:", typeof resolvedParams.id);
  console.log("URL:", request.url);
  console.log("===============================");
  try {
    const modelId = resolvedParams.id;

    console.log("DELETE request received for model ID:", modelId);
    console.log("Using DATABASE_ID:", DATABASE_ID);
    console.log("Using MODELS_COLLECTION_ID:", MODELS_COLLECTION_ID);
    console.log("Using BUCKET_ID:", BUCKET_ID);

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!DATABASE_ID || !MODELS_COLLECTION_ID || !BUCKET_ID) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get the model to verify it exists and get file ID
    let model;
    try {
      console.log("Attempting to get document with ID:", modelId);
      model = await databases.getDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        modelId
      );
      console.log("Model found:", model);
    } catch (getError: any) {
      console.error("Error getting model:", getError);
      console.error("Error type:", getError?.type);
      console.error("Error code:", getError?.code);
      console.error("Error message:", getError?.message);

      // Check for different types of Appwrite errors
      if (
        getError?.type === "document_not_found" ||
        getError?.code === 404 ||
        getError?.message?.includes(
          "Document with the requested ID could not be found"
        )
      ) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      if (
        getError?.type === "general_unauthorized_scope" ||
        getError?.code === 401
      ) {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to retrieve model",
          details:
            process.env.NODE_ENV === "development"
              ? {
                  type: getError?.type,
                  code: getError?.code,
                  message: getError?.message,
                }
              : undefined,
        },
        { status: 500 }
      );
    }

    const fileId = model.fileId;
    console.log("File ID to delete:", fileId);

    // Delete the file from storage bucket
    if (fileId) {
      try {
        await storage.deleteFile(BUCKET_ID, fileId);
        console.log(`File ${fileId} deleted from storage`);
      } catch (storageError: any) {
        console.error("Error deleting file from storage:", storageError);
        console.error("Storage error type:", storageError?.type);
        console.error("Storage error code:", storageError?.code);
        // Continue with database deletion even if file deletion fails
        // The file might already be deleted or not exist
      }
    }

    // Delete the model document from database
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        modelId
      );
      console.log(`Model ${modelId} deleted from database`);
    } catch (dbError: any) {
      console.error("Error deleting model from database:", dbError);
      console.error("DB error type:", dbError?.type);
      console.error("DB error code:", dbError?.code);

      return NextResponse.json(
        {
          error: "Failed to delete model from database",
          details:
            process.env.NODE_ENV === "development"
              ? {
                  type: dbError?.type,
                  code: dbError?.code,
                  message: dbError?.message,
                }
              : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Model deleted successfully",
        deletedModelId: modelId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in delete model API:", error);
    console.error("Main error type:", error?.type);
    console.error("Main error code:", error?.code);

    // Handle specific Appwrite errors
    if (
      error?.type === "document_not_found" ||
      error?.code === 404 ||
      error?.message?.includes(
        "Document with the requested ID could not be found"
      )
    ) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    if (error?.type === "general_unauthorized_scope" || error?.code === 401) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    if (error?.message?.includes("Missing required parameter")) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error occurred while deleting model",
        details:
          process.env.NODE_ENV === "development"
            ? {
                type: error?.type,
                code: error?.code,
                message: error?.message,
                stack: error?.stack,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
