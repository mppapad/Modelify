import { adminStorage, BUCKET_ID } from "@/lib/appwrite";
import { NextResponse, type NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    // Check authentication
    const { getUser, isAuthenticated } = getKindeServerSession();

    if (!isAuthenticated || !(await isAuthenticated())) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Validate file ID
    if (!fileId || fileId === "undefined" || fileId === "null") {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get file info first
    const fileInfo = await adminStorage.getFile(BUCKET_ID, fileId);

    // Get file data
    const fileData = await adminStorage.getFileDownload(BUCKET_ID, fileId);

    // Convert to Buffer - simple and reliable
    const buffer = Buffer.from(fileData as any);

    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": fileInfo.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileInfo.name}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);

    if (error?.code === 404 || error?.type === "storage_file_not_found") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (error?.code === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to download file", details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
