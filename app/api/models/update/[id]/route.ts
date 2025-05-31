import {
  adminDatabases,
  adminStorage,
  createAppwriteUserId,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
  BUCKET_ID,
  getFilePermissions,
} from "@/lib/appwrite";
import { NextResponse, type NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

interface UpdateModelRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params in Next.js 15
    const { id: modelId } = await params;

    const { getUser, isAuthenticated } = getKindeServerSession();

    if (!isAuthenticated || !(await isAuthenticated())) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const appwriteUserId = createAppwriteUserId(user.id);
    console.log("Kinde user ID:", user.id);
    console.log("Appwrite user ID:", appwriteUserId);

    console.log("Model ID from params:", modelId);

    if (!modelId || modelId === "undefined" || modelId === "null") {
      return NextResponse.json(
        { error: "Model ID is required and must be valid" },
        { status: 400 }
      );
    }

    if (!DATABASE_ID || !MODELS_COLLECTION_ID) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let existingModel;
    try {
      existingModel = await adminDatabases.getDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        modelId
      );
    } catch (fetchError: any) {
      console.error("Error fetching model:", fetchError);

      if (
        fetchError?.code === 404 ||
        fetchError?.type === "document_not_found"
      ) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Error fetching model", details: fetchError.message },
        { status: 500 }
      );
    }

    const isOwner =
      existingModel.userId === appwriteUserId ||
      existingModel.kindeUserId === user.id;

    if (!isOwner) {
      return NextResponse.json(
        {
          error: "Unauthorized: You don't have permission to update this model",
        },
        { status: 403 }
      );
    }

    let body: UpdateModelRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, description, isPublic } = body;

    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Model name cannot be empty" },
        { status: 400 }
      );
    }

    if (name && name.length > 100) {
      return NextResponse.json(
        { error: "Model name must be less than 100 characters" },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Model description must be less than 500 characters" },
        { status: 400 }
      );
    }

    if (
      name === undefined &&
      description === undefined &&
      isPublic === undefined
    ) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (isPublic !== undefined) {
      updateData.isPublic = Boolean(isPublic);
    }

    updateData.updatedAt = new Date().toISOString();

    if (isPublic !== undefined && isPublic !== existingModel.isPublic) {
      try {
        console.log(
          `Updating file permissions for ${existingModel.fileId}, isPublic: ${isPublic}`
        );

        const newPermissions = getFilePermissions(
          appwriteUserId,
          Boolean(isPublic)
        );

        await adminStorage.updateFile(
          BUCKET_ID,
          existingModel.fileId,
          undefined, // name (keep existing)
          newPermissions
        );

        console.log("File permissions updated successfully");
      } catch (permissionError: any) {
        console.error("Error updating file permissions:", permissionError);
      }
    }

    try {
      console.log("Attempting to update model ID:", modelId);
      console.log("Update data:", updateData);

      const updatedModel = await adminDatabases.updateDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        modelId,
        updateData
      );

      return NextResponse.json(
        {
          success: true,
          message: "Model updated successfully",
          model: {
            $id: updatedModel.$id,
            name: updatedModel.name,
            description: updatedModel.description || "",
            isPublic: updatedModel.isPublic || false,
            updatedAt: updatedModel.updatedAt,
            fileName: updatedModel.fileName,
            fileSize: updatedModel.fileSize,
            mimeType: updatedModel.mimeType,
            fileId: updatedModel.fileId,
            userId: updatedModel.userId,
            kindeUserId: updatedModel.kindeUserId,
            createdAt: updatedModel.createdAt,
          },
        },
        { status: 200 }
      );
    } catch (updateError: any) {
      console.error("Update error details:", updateError);
      console.error("Error code:", updateError?.code);
      console.error("Error type:", updateError?.type);
      console.error("Error message:", updateError?.message);

      if (
        updateError?.code === 404 ||
        updateError?.type === "document_not_found"
      ) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      if (
        updateError?.code === 401 ||
        updateError?.message?.includes("not authorized") ||
        updateError?.message?.includes("permission")
      ) {
        return NextResponse.json(
          {
            error:
              "Unauthorized: You don't have permission to update this model",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to update model",
          details: updateError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export const dynamic = "force-dynamic";
