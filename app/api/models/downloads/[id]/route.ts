// used in another revision of the codebase - TODO: check if this is still needed
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Storage, Databases, Query } from "appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(client);
const databases = new Databases(client);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params; // Await the params

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    // Get user session from cookies
    const cookieStore = await cookies(); // Await cookies as well
    const session = cookieStore.get("appwrite-session");

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Set session for the client
    client.setSession(session.value);

    // Fetch model from database to verify ownership
    const model = await databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_MODELS_COLLECTION_ID!,
      modelId
    );

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Get the file from Appwrite Storage
    const file = await storage.getFileDownload(
      process.env.NEXT_PUBLIC_BUCKET_ID!,
      model.fileId
    );

    // Create response with proper headers
    const response = new NextResponse(file);

    response.headers.set(
      "Content-Type",
      model.mimeType || "application/octet-stream"
    );
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${model.fileName}"`
    );
    response.headers.set("Cache-Control", "no-cache");

    return response;
  } catch (error: any) {
    console.error("Download error:", error);

    if (error.code === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (error.code === 401) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
