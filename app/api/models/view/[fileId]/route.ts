import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminStorage,
  BUCKET_ID,
  adminDatabases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite";
import { createAppwriteUserId } from "@/lib/appwrite"; // Fix import path

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Await the params in Next.js 15
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get the user from Kinde session (if authenticated)
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Check if the file exists and if it's public or the user has access
    try {
      // First check if the model document exists and if it's public
      let isPublic = false;
      let isOwner = false;

      try {
        // Query the database to find the model document
        const models = await adminDatabases.listDocuments(
          DATABASE_ID,
          MODELS_COLLECTION_ID,
          [`fileId=${fileId}`]
        );

        if (models.documents.length > 0) {
          const modelDoc = models.documents[0];
          isPublic = modelDoc.isPublic === true;

          // Check if the user is the owner
          if (
            user &&
            (modelDoc.kindeUserId === user.id ||
              modelDoc.userId === createAppwriteUserId(user.id))
          ) {
            isOwner = true;
          }
        }
      } catch (dbError) {
        console.error("Error checking model document:", dbError);
        // Continue anyway - we'll check file permissions directly
      }

      // If not public and not the owner, check if the user is authenticated
      if (!isPublic && !isOwner && !user) {
        return NextResponse.json(
          { error: "Authentication required to access this file" },
          { status: 401 }
        );
      }

      // Get file info to check if it exists
      const fileInfo = await adminStorage.getFile(BUCKET_ID, fileId);

      // Get the file data as a binary blob
      const fileData = await adminStorage.getFileDownload(BUCKET_ID, fileId);

      // Convert to Buffer
      const buffer = Buffer.from(fileData as any);

      // CRITICAL: Set the correct Content-Type based on the file type
      let contentType = fileInfo.mimeType || "application/octet-stream";

      // Force correct MIME types for 3D models if needed
      if (fileInfo.name.endsWith(".glb")) {
        contentType = "model/gltf-binary";
      } else if (fileInfo.name.endsWith(".gltf")) {
        contentType = "model/gltf+json";
      } else if (fileInfo.name.endsWith(".usdz")) {
        contentType = "model/vnd.usdz+zip";
      }

      // Set content disposition based on download parameter
      const contentDisposition = download
        ? `attachment; filename="${fileInfo.name}"`
        : `inline; filename="${fileInfo.name}"`;

      // Return the file with appropriate headers
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": isPublic
            ? "public, max-age=86400"
            : "private, no-cache", // Cache public files longer
          "X-Content-Type-Options": "nosniff",
          // Add CORS headers to allow model-viewer to load the file
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } catch (storageError: any) {
      console.error("Storage error:", storageError);

      if (
        storageError?.code === 404 ||
        storageError?.type === "storage_file_not_found"
      ) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      if (
        storageError?.code === 401 ||
        storageError?.message?.includes("not authorized")
      ) {
        return NextResponse.json(
          { error: "You don't have permission to access this file" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Failed to retrieve file" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("File view error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export const dynamic = "force-dynamic";
