import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
} from "@/lib/appwrite-server";
import { createAppwriteUserId } from "@/lib/appwrite";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    // Get the user from Kinde session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);

    // Check if user already exists
    try {
      const existingUser = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        appwriteUserId
      );

      return NextResponse.json({
        success: true,
        user: existingUser,
        appwriteUserId,
      });
    } catch (error: any) {
      // If user doesn't exist (404), create them
      if (error.code === 404) {
        const newUser = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          appwriteUserId,
          {
            name:
              user.given_name && user.family_name
                ? `${user.given_name} ${user.family_name}`
                : user.email?.split("@")[0] || "User",
            email: user.email || "",
            kindeUserId: user.id,
            createdAt: new Date().toISOString(),
          }
        );

        return NextResponse.json({
          success: true,
          user: newUser,
          appwriteUserId,
          created: true,
        });
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}
