import { NextRequest, NextResponse } from "next/server";
import {
  databases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite-server";

import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // No authentication required for public models
    const documents = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [
        Query.equal("isPublic", true),
        Query.orderDesc("createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return NextResponse.json({
      models: documents.documents,
      total: documents.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching public models:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch public models" },
      { status: 500 }
    );
  }
}
