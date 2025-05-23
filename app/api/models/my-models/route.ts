import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  databases,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { createAppwriteUserId } from "@/lib/appwrite";
import { Query } from "node-appwrite";

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Query only documents belonging to the current user
    const documents = await databases.listDocuments(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      [
        Query.equal("userId", appwriteUserId),
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
    console.error("Error fetching user models:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch models" },
      { status: 500 }
    );
  }
}
