import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { adminDatabases, config } from "@/lib/appwrite";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
const URL_EXPIRY = 3600; // 1 hour in seconds

// GET - Get secure URL for model viewing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { id } = await params; // Await the params

    // Get model details
    const model = await adminDatabases.getDocument(
      config.databaseId,
      config.modelsCollectionId,
      id
    );

    // Check access permissions
    const canAccess = model.isPublic || (user && model.kindeUserId === user.id);

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate secure token
    const token = sign(
      {
        modelId: id,
        fileId: model.fileId,
        userId: user?.id || null,
        exp: Math.floor(Date.now() / 1000) + URL_EXPIRY,
      },
      JWT_SECRET
    );

    // Create secure URL
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin");
    const secureUrl = `${baseUrl}/api/models/${id}/stream?token=${token}`;

    return NextResponse.json({
      success: true,
      url: secureUrl,
      expiresAt: new Date(Date.now() + URL_EXPIRY * 1000).toISOString(),
      model: {
        id: model.$id,
        name: model.name,
        description: model.description,
        fileName: model.fileName,
        fileSize: model.fileSize,
        mimeType: model.mimeType,
        isPublic: model.isPublic,
        createdAt: model.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating secure URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate secure URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
