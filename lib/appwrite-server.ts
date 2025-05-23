import { Client, Databases, Storage, Users } from "node-appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!); // Server-side API key

export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const MODELS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MODELS_COLLECTION_ID!;
export const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
