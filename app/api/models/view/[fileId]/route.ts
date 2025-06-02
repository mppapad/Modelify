import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminDatabases,
  adminStorage,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
  BUCKET_ID,
} from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Get user session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Get fileId from params
    const { fileId } = await params;

    // Validate fileId
    if (!fileId || fileId.trim() === "") {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";

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

    // Check access permissions
    const hasAccess = model.isPublic || (user && model.kindeUserId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the file from Appwrite storage
    try {
      let fileBuffer: ArrayBuffer;
      let contentLength: number;

      // Use direct URL method as it's more reliable across SDK versions
      const appwriteFileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${model.fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;

      const fileResponse = await fetch(appwriteFileUrl, {
        headers: {
          "X-Appwrite-Key": process.env.APPWRITE_API_KEY!,
        },
      });

      if (!fileResponse.ok) {
        throw new Error(
          `Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`
        );
      }

      fileBuffer = await fileResponse.arrayBuffer();
      contentLength = fileBuffer.byteLength;

      // Determine content type
      let contentType = model.mimeType || "application/octet-stream";
      const fileName = model.fileName?.toLowerCase() || "";

      if (fileName.endsWith(".glb")) {
        contentType = "model/gltf-binary";
      } else if (fileName.endsWith(".gltf")) {
        contentType = "model/gltf+json";
      } else if (fileName.endsWith(".usdz")) {
        contentType = "model/vnd.usdz+zip";
      }

      // Prepare response headers
      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "Content-Length": contentLength.toString(),
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      if (isDownload) {
        headers["Content-Disposition"] = `attachment; filename="${
          model.fileName || `model-${fileId}`
        }"`;
      } else {
        headers["Content-Disposition"] = `inline; filename="${
          model.fileName || `model-${fileId}`
        }"`;
        headers["Cache-Control"] = "public, max-age=31536000";
      }

      // Optional: Log access for analytics
      console.log(
        `Model accessed: ${model.name} (${fileId}) by user: ${
          user?.id || "anonymous"
        }`
      );

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (storageError) {
      console.error("Storage error:", storageError);
      return NextResponse.json(
        {
          error: "File not found in storage",
          details:
            storageError instanceof Error
              ? storageError.message
              : "Unknown storage error",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Add HEAD method for preflight checks
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const { fileId } = await params;

    // Quick validation without fetching the actual file
    const models = await adminDatabases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("fileId", fileId)]
    );

    if (models.documents.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const model = models.documents[0];
    const hasAccess = model.isPublic || (user && model.kindeUserId === user.id);

    if (!hasAccess) {
      return new NextResponse(null, { status: 403 });
    }

    // Get file info without downloading content
    try {
      const fileInfo = await adminStorage.getFile(BUCKET_ID, model.fileId);

      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Length": fileInfo.sizeOriginal.toString(),
          "Content-Type": model.mimeType || "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (error) {
      console.error("HEAD request storage error:", error);
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    console.error("HEAD request error:", error);
    return new NextResponse(null, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
