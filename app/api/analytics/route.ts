import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  databases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { createAppwriteUserId } from "@/lib/appwrite";
import { Query, type Models } from "node-appwrite";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

// Use environment variable for analytics collection
const ANALYTICS_COLLECTION_ID =
  process.env.APPWRITE_ANALYTICS_COLLECTION_ID || "analytics_events";

// Define types for analytics events extending Appwrite Document
interface AnalyticsEvent extends Models.Document {
  userId: string;
  modelId: string;
  modelName: string;
  eventType: "view" | "download";
  timestamp: string;
  viewerIp: string;
  userAgent?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
}

// Define type for model documents extending Appwrite Document
interface ModelDocument extends Models.Document {
  userId: string;
  name: string;
  fileName?: string;
  views: number;
  downloads: number;
}

export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Parse time range
    const days = Number.parseInt(range.replace("d", ""));
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    console.log(
      `📊 Fetching analytics for user ${appwriteUserId} for ${days} days`
    );

    // Get user's models
    const modelsResponse = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [Query.equal("userId", appwriteUserId), Query.orderDesc("$createdAt")]
    );

    const models = modelsResponse.documents as ModelDocument[];
    console.log(`📁 Found ${models.length} models for user`);

    // Get analytics events for user's models
    let analyticsEvents: AnalyticsEvent[] = [];
    try {
      const eventsResponse = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [
          Query.equal("userId", appwriteUserId),
          Query.greaterThanEqual("timestamp", startDate.toISOString()),
          Query.lessThanEqual("timestamp", endDate.toISOString()),
          Query.orderDesc("timestamp"),
          Query.limit(1000), // Adjust as needed
        ]
      );
      analyticsEvents = eventsResponse.documents as AnalyticsEvent[];
      console.log(`📈 Found ${analyticsEvents.length} analytics events`);
    } catch (error) {
      console.error("Analytics collection error (using fallback data):", error);
      // Fall back to model-level data if analytics collection doesn't exist
    }

    // Calculate real analytics from events
    const viewEvents = analyticsEvents.filter((e) => e.eventType === "view");
    const downloadEvents = analyticsEvents.filter(
      (e) => e.eventType === "download"
    );

    // Fix: Use event counts directly when available, otherwise fall back to model data
    // This ensures we're using the most accurate data source
    const totalViews =
      viewEvents.length > 0
        ? viewEvents.length
        : models.reduce((sum, model) => sum + (model.views || 0), 0);

    const totalDownloads =
      downloadEvents.length > 0
        ? downloadEvents.length
        : models.reduce((sum, model) => sum + (model.downloads || 0), 0);

    // Calculate unique visitors (by IP)
    const uniqueIPs = new Set(analyticsEvents.map((e) => e.viewerIp)).size;
    const uniqueVisitors =
      uniqueIPs > 0 ? uniqueIPs : Math.floor(totalViews * 0.7);

    console.log(
      `📊 Analytics summary: ${totalViews} views, ${totalDownloads} downloads, ${uniqueVisitors} unique visitors`
    );

    // Generate time series data from real events
    const viewsOverTime = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayEvents = analyticsEvents.filter((e) => {
        const eventDate = new Date(e.timestamp);
        return eventDate >= dayStart && eventDate <= dayEnd;
      });

      const dayViews = dayEvents.filter((e) => e.eventType === "view").length;
      const dayDownloads = dayEvents.filter(
        (e) => e.eventType === "download"
      ).length;
      const dayUniqueVisitors = new Set(dayEvents.map((e) => e.viewerIp)).size;

      return {
        date: format(date, "MMM dd"),
        views: dayViews,
        downloads: dayDownloads,
        uniqueVisitors: dayUniqueVisitors,
      };
    });

    // Top models by views - use analytics events when available
    // Create a map of model views from analytics events
    const modelViewsMap: Record<string, number> = {};
    const modelDownloadsMap: Record<string, number> = {};

    if (analyticsEvents.length > 0) {
      analyticsEvents.forEach((event) => {
        if (event.eventType === "view") {
          modelViewsMap[event.modelId] =
            (modelViewsMap[event.modelId] || 0) + 1;
        } else if (event.eventType === "download") {
          modelDownloadsMap[event.modelId] =
            (modelDownloadsMap[event.modelId] || 0) + 1;
        }
      });
    }

    // Use the event-based counts when available, otherwise fall back to model document counts
    const topModels = models
      .map((model) => ({
        name: model.name,
        views:
          modelViewsMap[model.$id] !== undefined
            ? modelViewsMap[model.$id]
            : model.views || 0,
        downloads:
          modelDownloadsMap[model.$id] !== undefined
            ? modelDownloadsMap[model.$id]
            : model.downloads || 0,
        fileType: model.fileName?.split(".").pop()?.toUpperCase() || "GLB",
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device breakdown from real analytics events
    const deviceCounts = analyticsEvents.reduce((acc, event) => {
      const device = event.deviceType || "desktop";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEvents = analyticsEvents.length || 1;
    const deviceBreakdown = [
      {
        device: "Desktop",
        count: deviceCounts.desktop || 0,
        percentage: Math.round(
          ((deviceCounts.desktop || 0) / totalEvents) * 100
        ),
      },
      {
        device: "Mobile",
        count: deviceCounts.mobile || 0,
        percentage: Math.round(
          ((deviceCounts.mobile || 0) / totalEvents) * 100
        ),
      },
      {
        device: "Tablet",
        count: deviceCounts.tablet || 0,
        percentage: Math.round(
          ((deviceCounts.tablet || 0) / totalEvents) * 100
        ),
      },
    ];

    // Recent activity from real events
    const recentActivity = analyticsEvents.slice(0, 10).map((event, index) => ({
      id: event.$id || index.toString(),
      action: event.eventType === "view" ? "View" : "Download",
      modelName: event.modelName || "Unknown Model",
      timestamp: formatTimeAgo(event.timestamp),
      userAgent: parseUserAgent(event.userAgent || "Unknown"),
      country: "Unknown", // You could add IP geolocation here
    }));

    // Geographic data (placeholder - you could implement IP geolocation)
    const geographicData = [
      { country: "Unknown", views: totalViews, percentage: 100 },
    ];

    const analytics = {
      overview: {
        totalViews,
        totalDownloads,
        uniqueVisitors,
        avgViewTime: 145, // This would need session tracking to calculate accurately
        topModel: topModels[0]?.name || "No models",
        growthRate: calculateGrowthRate(analyticsEvents, days),
      },
      viewsOverTime,
      topModels,
      deviceBreakdown,
      geographicData,
      recentActivity,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffMs = now.getTime() - eventTime.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function parseUserAgent(userAgent: string): string {
  // Simple user agent parsing
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Unknown Browser";
}

function calculateGrowthRate(events: AnalyticsEvent[], days: number): number {
  if (events.length === 0) return 0;

  const midPoint = Math.floor(days / 2);
  const cutoffDate = subDays(new Date(), midPoint);

  const recentEvents = events.filter((e) => {
    const eventDate = new Date(e.timestamp);
    return eventDate >= cutoffDate;
  }).length;

  const olderEvents = events.filter((e) => {
    const eventDate = new Date(e.timestamp);
    return eventDate < cutoffDate;
  }).length;

  if (olderEvents === 0) return recentEvents > 0 ? 100 : 0;
  return Math.round(((recentEvents - olderEvents) / olderEvents) * 100);
}
