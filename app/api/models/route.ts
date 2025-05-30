import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { adminDatabases, adminStorage, config } from "@/lib/appwrite";
import { createAppwriteUserId } from "@/lib/appwrite";
import { Query } from "appwrite";

// GET - List user's models
export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const publicOnly = searchParams.get("public") === "true";

    const queries = [];

    if (!publicOnly) {
      // Use the same user ID generation as sync API
      const appwriteUserId = createAppwriteUserId(user.id);
      queries.push(Query.equal("userId", appwriteUserId));
    } else {
      queries.push(Query.equal("isPublic", true));
    }

    if (search) {
      queries.push(Query.search("name", search));
    }

    queries.push(Query.orderDesc("createdAt"));
    queries.push(Query.limit(limit));
    queries.push(Query.offset((page - 1) * limit));

    const models = await adminDatabases.listDocuments(
      config.databaseId,
      config.modelsCollectionId,
      queries
    );

    return NextResponse.json({
      success: true,
      models: models.documents,
      total: models.total,
      page,
      limit,
      totalPages: Math.ceil(models.total / limit),
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch models",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
