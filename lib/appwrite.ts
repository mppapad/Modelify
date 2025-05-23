import { Client, Account, Databases, Storage, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const MODELS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MODELS_COLLECTION_ID!; // Your existing collection for models
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!; // New collection for users
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

// Validate environment variables
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable");
}
if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable"
  );
}
if (!DATABASE_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable"
  );
}
if (!MODELS_COLLECTION_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_MODELS_COLLECTION_ID environment variable"
  );
}
if (!USERS_COLLECTION_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID environment variable"
  );
}
if (!BUCKET_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_APPWRITE_BUCKET_ID environment variable"
  );
}

// Helper function to create Appwrite-compatible user ID from Kinde user ID
export const createAppwriteUserId = (kindeUserId: string): string => {
  // Remove any special characters and ensure it starts with alphanumeric
  const cleanId = kindeUserId.replace(/[^a-zA-Z0-9._-]/g, "");

  // If it starts with a special char, prefix with 'u'
  const safeId = /^[a-zA-Z0-9]/.test(cleanId) ? cleanId : `u${cleanId}`;

  // Truncate to 36 chars max
  return safeId.substring(0, 36);
};

export { client, ID };
