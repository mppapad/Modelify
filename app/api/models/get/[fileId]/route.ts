import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminDatabases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite";
import { Query } from "appwrite"; // ✅ Import Query

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get the user from Kinde session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // ✅ FIX: Use proper Query syntax (same as your view endpoint)
    const models = await adminDatabases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("fileId", fileId)] // ✅ Correct syntax
    );

    if (models.documents.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = models.documents[0];

    // ✅ FIX: Use consistent field name (kindeUserId vs userId)
    // Check if the user has access to this model
    if (!model.isPublic && (!user || model.kindeUserId !== user.id)) {
      return NextResponse.json(
        { error: "You don't have permission to access this model" },
        { status: 403 }
      );
    }

    // Return the model data
    return NextResponse.json({
      model: {
        $id: model.$id,
        name: model.name,
        description: model.description,
        fileId: model.fileId,
        fileName: model.fileName,
        fileSize: model.fileSize,
        mimeType: model.mimeType,
        userId: model.userId,
        isPublic: model.isPublic,
        createdAt: model.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching model:", error);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
