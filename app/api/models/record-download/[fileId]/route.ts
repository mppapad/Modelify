import { type NextRequest, NextResponse } from "next/server";
import {
  databases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { Query, ID } from "node-appwrite";

const ANALYTICS_COLLECTION_ID =
  process.env.APPWRITE_ANALYTICS_COLLECTION_ID || "analytics_events";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    // Await the params Promise
    const { fileId } = await context.params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Rest of your implementation...
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const referer = request.headers.get("referer") || "";

    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    const modelsResponse = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("fileId", fileId)]
    );

    if (modelsResponse.documents.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = modelsResponse.documents[0];
    const currentDownloads = model.downloads || 0;

    await databases.updateDocument(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      model.$id,
      {
        downloads: currentDownloads + 1,
        lastDownloadedAt: new Date().toISOString(),
      }
    );

    try {
      await databases.createDocument(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        ID.unique(),
        {
          eventType: "download",
          modelId: model.$id,
          modelName: model.name,
          fileId: fileId,
          userId: model.userId,
          viewerIp: ip,
          userAgent: userAgent,
          deviceType: deviceType,
          referer: referer,
          timestamp: new Date().toISOString(),
          sessionId: `${ip}-${Date.now()}`,
        }
      );
      console.log(
        `✅ Analytics event recorded: download for model ${model.name}`
      );
    } catch (analyticsError) {
      console.error("Failed to record analytics event:", analyticsError);
    }

    console.log(
      `📥 Download recorded for model: ${model.name} (Total downloads: ${
        currentDownloads + 1
      })`
    );

    return NextResponse.json({
      success: true,
      downloads: currentDownloads + 1,
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return NextResponse.json(
      { error: "Failed to record download" },
      { status: 500 }
    );
  }
}
