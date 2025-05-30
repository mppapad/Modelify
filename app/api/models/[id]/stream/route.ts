import { NextRequest, NextResponse } from "next/server";
import { adminDatabases, adminStorage, config } from "@/lib/appwrite";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// GET - Stream the model file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.modelId !== id) {
      return NextResponse.json(
        { error: "Token model mismatch" },
        { status: 401 }
      );
    }

    // Stream file from Appwrite
    const fileBuffer = await adminStorage.getFileDownload(
      config.bucketId,
      decoded.fileId
    );

    // Get model info for proper headers
    const model = await adminDatabases.getDocument(
      config.databaseId,
      config.modelsCollectionId,
      id
    );

    // Set appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", model.mimeType || "application/octet-stream");
    headers.set("Content-Length", model.fileSize.toString());
    headers.set("Content-Disposition", `inline; filename="${model.fileName}"`);
    headers.set("Cache-Control", "private, max-age=3600");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return new NextResponse(fileBuffer, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("Error streaming file:", error);
    return NextResponse.json(
      {
        error: "Failed to stream file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// HEAD request for CORS preflight
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Await the params
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new NextResponse(null, { headers, status: 200 });
}
