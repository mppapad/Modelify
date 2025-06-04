import { type NextRequest, NextResponse } from "next/server";
import {
  databases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { Query, ID } from "node-appwrite";

// Use environment variable for analytics collection
const ANALYTICS_COLLECTION_ID =
  process.env.APPWRITE_ANALYTICS_COLLECTION_ID || "analytics_events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> } // ✅ Make params a Promise
) {
  try {
    // ✅ Await params before accessing properties
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get user info from request headers or IP
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const referer = request.headers.get("referer") || "";

    // Parse device type from user agent
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    // Find the model document by fileId
    const modelsResponse = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("fileId", fileId)]
    );

    if (modelsResponse.documents.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const model = modelsResponse.documents[0];

    // Update model view count and lastViewedAt
    const currentViews = model.views || 0;
    await databases.updateDocument(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      model.$id,
      {
        views: currentViews + 1,
        lastViewedAt: new Date().toISOString(),
      }
    );

    // Record detailed analytics event
    try {
      await databases.createDocument(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        ID.unique(),
        {
          eventType: "view",
          modelId: model.$id,
          modelName: model.name,
          fileId: fileId,
          userId: model.userId, // Owner of the model
          viewerIp: ip,
          userAgent: userAgent,
          deviceType: deviceType,
          referer: referer,
          timestamp: new Date().toISOString(),
          sessionId: `${ip}-${Date.now()}`, // Simple session tracking
        }
      );
      console.log(`✅ Analytics event recorded: view for model ${model.name}`);
    } catch (analyticsError) {
      console.error("Failed to record analytics event:", analyticsError);
      // Don't fail the request if analytics fails
    }

    console.log(
      `📊 View recorded for model: ${model.name} (Total views: ${
        currentViews + 1
      })`
    );

    return NextResponse.json({
      success: true,
      views: currentViews + 1,
    });
  } catch (error) {
    console.error("Error recording view:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
