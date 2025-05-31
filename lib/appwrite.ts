import {
  Client,
  Account,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
} from "appwrite";

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

// Helper function to get file permissions based on public status
export const getFilePermissions = (userId: string, isPublic = false) => {
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  // Add public read permission if the file is public
  if (isPublic) {
    permissions.push(Permission.read(Role.any()));
  }

  return permissions;
};

// Admin client for server-side operations - lazy initialization
let _adminClient: Client | null = null;
let _adminDatabases: Databases | null = null;
let _adminStorage: Storage | null = null;

const createAdminClient = () => {
  if (_adminClient) return _adminClient;

  if (!process.env.APPWRITE_API_KEY) {
    throw new Error(
      "APPWRITE_API_KEY environment variable is required for server-side operations"
    );
  }

  _adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

  // Set API key using header (most compatible approach)
  _adminClient.headers = {
    ..._adminClient.headers,
    "X-Appwrite-Key": process.env.APPWRITE_API_KEY,
  };

  return _adminClient;
};

// Lazy getters for admin instances - only initialize when accessed
export const adminDatabases = new Proxy({} as Databases, {
  get(target, prop) {
    if (!_adminDatabases) {
      _adminDatabases = new Databases(createAdminClient());
    }
    return (_adminDatabases as any)[prop];
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(target, prop) {
    if (!_adminStorage) {
      _adminStorage = new Storage(createAdminClient());
    }
    return (_adminStorage as any)[prop];
  },
});

// Additional exports for compatibility
export const config = {
  databaseId: DATABASE_ID,
  usersCollectionId: USERS_COLLECTION_ID,
  modelsCollectionId: MODELS_COLLECTION_ID,
  bucketId: BUCKET_ID,
};

export { client, ID, Permission, Role };
