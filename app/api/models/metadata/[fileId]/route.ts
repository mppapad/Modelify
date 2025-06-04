// app/api/models/metadata/[fileId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminDatabases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Get fileId from params
    const { fileId } = await params;

    // Validate fileId
    if (!fileId || fileId.trim() === "") {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    // Query the database to find the model document by fileId
    let models;
    try {
      models = await adminDatabases.listDocuments(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        [Query.equal("fileId", fileId)]
      );
    } catch (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        {
          error: "Database query failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    if (models.documents.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = models.documents[0];

    // Get user session (but don't fail if not authenticated)
    let user = null;
    try {
      const { getUser } = getKindeServerSession();
      user = await getUser();
    } catch (error) {
      // User is not authenticated
      console.log("User not authenticated for metadata request");
    }

    // Check access permissions
    const hasAccess = model.isPublic || (user && model.kindeUserId === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "This model is private. Please log in to access it.",
          requiresAuth: !model.isPublic,
        },
        { status: 403 }
      );
    }

    // Return model metadata (without the actual file)
    const metadata = {
      id: model.$id,
      fileId: model.fileId,
      name: model.name,
      description: model.description,
      fileName: model.fileName,
      mimeType: model.mimeType,
      isPublic: model.isPublic,
      views: model.views || 0,
      createdAt: model.$createdAt,
      updatedAt: model.$updatedAt,
      lastViewedAt: model.lastViewedAt,
      tags: model.tags || [],
      category: model.category,
      // Don't expose sensitive data like kindeUserId
    };

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error("Metadata API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
