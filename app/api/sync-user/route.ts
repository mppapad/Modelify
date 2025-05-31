import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  databases,
  users,
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

    // Use your existing createAppwriteUserId function
    const appwriteUserId = createAppwriteUserId(user.id);

    let appwriteUser;
    let isNewUser = false;

    // Step 1: Check if user exists in Appwrite Auth, if not create them
    try {
      console.log("Checking if user exists in Appwrite Auth:", appwriteUserId);
      appwriteUser = await users.get(appwriteUserId);
      console.log("User found in Appwrite Auth:", appwriteUser.$id);
    } catch (error: any) {
      console.log(
        "User not found in Appwrite Auth, error:",
        error.code,
        error.message
      );

      if (error.code === 404) {
        try {
          console.log("Creating user in Appwrite Auth...");
          // Create user in Appwrite Auth
          appwriteUser = await users.create(
            appwriteUserId,
            user.email || "",
            undefined, // phone (optional)
            undefined, // password (not needed for OAuth users)
            user.given_name && user.family_name
              ? `${user.given_name} ${user.family_name}`
              : user.email?.split("@")[0] || "User"
          );
          console.log(
            "Successfully created user in Appwrite Auth:",
            appwriteUser.$id
          );
          isNewUser = true;
        } catch (createError: any) {
          console.error("Failed to create user in Appwrite Auth:", createError);
          throw createError;
        }
      } else {
        throw error;
      }
    }

    // Step 2: Handle the user document in your custom collection
    let userDocument;
    try {
      userDocument = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        appwriteUserId
      );

      // User document exists, return it
      return NextResponse.json({
        success: true,
        user: userDocument,
        appwriteUser,
        appwriteUserId,
        isNewUser: false,
      });
    } catch (error: any) {
      // If document doesn't exist (404), create it
      if (error.code === 404) {
        userDocument = await databases.createDocument(
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
          user: userDocument,
          appwriteUser,
          appwriteUserId,
          isNewUser,
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
