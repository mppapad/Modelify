import { Client, Account, Users } from "node-appwrite";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Server-side Appwrite client
const adminClient = new Client();
adminClient
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const users = new Users(adminClient);

// Function to create a valid Appwrite user ID from Kinde ID
function createAppwriteUserId(kindeId: string): string {
  // Create a hash of the Kinde ID to ensure it fits within 36 chars
  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update(kindeId).digest("hex");
  // Take first 32 characters and add 'u_' prefix to ensure it starts with a letter
  return "u_" + hash.substring(0, 32);
}

// Function to create or get user in Appwrite using Kinde data
export async function createAppwriteUser() {
  const { getUser, isAuthenticated } = getKindeServerSession();

  if (!isAuthenticated()) {
    throw new Error("User not authenticated with Kinde");
  }

  const kindeUser = await getUser();
  if (!kindeUser) {
    throw new Error("No Kinde user found");
  }

  // Create a valid Appwrite user ID
  const appwriteUserId = createAppwriteUserId(kindeUser.id);

  try {
    // Try to get existing user
    const existingUser = await users.get(appwriteUserId);
    return existingUser;
  } catch (error) {
    // User doesn't exist, create new one
    try {
      const newUser = await users.create(
        appwriteUserId, // Use hashed/shortened ID
        kindeUser.email || "",
        undefined, // phone (optional)
        undefined, // password (not needed for custom auth)
        kindeUser.given_name || kindeUser.email || "User"
      );
      return newUser;
    } catch (createError) {
      console.error("Error creating Appwrite user:", createError);
      throw createError;
    }
  }
}

// Function to create JWT for custom session
export async function createCustomJWT() {
  const { isAuthenticated } = getKindeServerSession();

  if (!isAuthenticated()) {
    return null;
  }

  try {
    // Ensure user exists in Appwrite
    const appwriteUser = await createAppwriteUser();

    // Create JWT token for the user
    const jwt = await users.createJWT(appwriteUser.$id);
    return jwt.jwt;
  } catch (error) {
    console.error("Error creating custom JWT:", error);
    return null;
  }
}
