import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { adminDatabases, adminStorage, config } from "@/lib/appwrite";

// GET - Get single model
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { id } = await params; // Await the params

    const model = await adminDatabases.getDocument(
      config.databaseId,
      config.modelsCollectionId,
      id
    );

    // Check if user can access this model
    if (!model.isPublic && (!user || model.kindeUserId !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      model,
    });
  } catch (error) {
    console.error("Error fetching model:", error);
    return NextResponse.json(
      {
        error: "Model not found",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 404 }
    );
  }
}

// PUT - Update model
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { id } = await params; // Await the params

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic } = body;

    // Check if user owns this model
    const existingModel = await adminDatabases.getDocument(
      config.databaseId,
      config.modelsCollectionId,
      id
    );

    if (existingModel.kindeUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedModel = await adminDatabases.updateDocument(
      config.databaseId,
      config.modelsCollectionId,
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      }
    );

    return NextResponse.json({
      success: true,
      model: updatedModel,
    });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      {
        error: "Failed to update model",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete model
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { id } = await params; // Await the params

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this model
    const existingModel = await adminDatabases.getDocument(
      config.databaseId,
      config.modelsCollectionId,
      id
    );

    if (existingModel.kindeUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete file from storage
    try {
      await adminStorage.deleteFile(config.bucketId, existingModel.fileId);
    } catch (error) {
      console.warn("Failed to delete file from storage:", error);
    }

    // Delete model record
    await adminDatabases.deleteDocument(
      config.databaseId,
      config.modelsCollectionId,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Model deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      {
        error: "Failed to delete model",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
