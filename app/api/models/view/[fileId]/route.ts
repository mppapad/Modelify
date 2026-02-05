import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminDatabases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
  BUCKET_ID,
} from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    // Get fileId from params
    const { fileId } = await params;

    // Validate fileId
    if (!fileId || fileId.trim() === "") {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";

    // Query the database to find the model document
    const models = await adminDatabases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("fileId", fileId)],
    );

    if (models.documents.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = models.documents[0];

    // Check authentication
    let user = null;
    try {
      const { getUser } = getKindeServerSession();
      user = await getUser();
    } catch (error) {
      // User is not authenticated, which is fine for public models
    }

    // Check access permissions
    const hasAccess = model.isPublic || (user && model.kindeUserId === user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get Appwrite configuration
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!projectId || !apiKey || !endpoint) {
      throw new Error("Missing Appwrite configuration");
    }

    // Build the Appwrite file URL
    const appwriteFileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${model.fileId}/view?project=${projectId}`;

    // Fetch the file from Appwrite WITH streaming
    let fileResponse = await fetch(appwriteFileUrl, {
      headers: {
        "X-Appwrite-Key": apiKey,
      },
    });

    if (!fileResponse.ok) {
      // Try alternative without query parameter
      const alternativeUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${model.fileId}/view`;
      fileResponse = await fetch(alternativeUrl, {
        headers: {
          "X-Appwrite-Key": apiKey,
          "X-Appwrite-Project": projectId,
        },
      });

      if (!fileResponse.ok) {
        return NextResponse.json(
          {
            error: "Failed to fetch file from storage",
            details: `Storage returned ${fileResponse.status}: ${fileResponse.statusText}`,
          },
          { status: 500 },
        );
      }
    }

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

    // Get content length from response headers or model
    const contentLength =
      fileResponse.headers.get("content-length") ||
      model.fileSize?.toString() ||
      "0";

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": contentLength,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    };

    if (isDownload) {
      headers["Content-Disposition"] =
        `attachment; filename="${model.fileName || `model-${model.fileId}.glb`}"`;
    }

    // 🔥 CRITICAL: Return the streaming response
    // Pass through the response body as a ReadableStream
    return new NextResponse(fileResponse.body as ReadableStream<Uint8Array>, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// HEAD method - Keep as is but add cache headers
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { fileId } = await params;

    // Quick check if model exists
    const models = await adminDatabases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("fileId", fileId)],
    );

    if (models.documents.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const model = models.documents[0];

    // Check authentication
    let user = null;
    try {
      const { getUser } = getKindeServerSession();
      user = await getUser();
    } catch (error) {}

    const hasAccess = model.isPublic || (user && model.kindeUserId === user.id);
    if (!hasAccess) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": model.mimeType || "application/octet-stream",
        "Content-Length": model.fileSize?.toString() || "0",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

// OPTIONS method
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Appwrite-Key, Range",
      "Access-Control-Expose-Headers": "Content-Length, Accept-Ranges",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export const dynamic = "force-dynamic";
