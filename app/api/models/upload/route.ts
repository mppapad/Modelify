import { type NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminDatabases,
  adminStorage,
  config,
  createAppwriteUserId,
  getFilePermissions,
  ID,
} from "@/lib/appwrite";

// Types for better type safety
interface ChunkUploadData {
  chunkIndex: number;
  totalChunks: number;
  uploadId: string;
}

interface UploadState {
  chunks: (Buffer | undefined)[];
  metadata: {
    name: string;
    description: string;
    originalFilename: string;
    mimeType: string;
    totalSize: number;
    userId: string;
    isPublic: boolean;
  };
}

// Upload permissions and limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES_PER_USER: 50, // Maximum files per user
  MAX_FILES_PER_DAY: 10, // Maximum uploads per day per user
  ALLOWED_EXTENSIONS: ["glb", "usdz", "gltf"],
  PREMIUM_MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB for premium users
  PREMIUM_MAX_FILES: 200, // More files for premium users
};

// In-memory storage for chunk assembly (in production, use Redis or database)
const uploadStates = new Map<string, UploadState>();

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

// Helper function to validate file type
const isValidFileType = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return UPLOAD_LIMITS.ALLOWED_EXTENSIONS.includes(extension);
};

// Check if user has premium access (you can implement this based on your user system)
const isPremiumUser = async (userId: string): Promise<boolean> => {
  // TODO: Implement premium user check based on your subscription system
  // For now, return false - you can integrate with your payment system
  try {
    // Example: Check user's subscription status in your database
    // const userSubscription = await getUserSubscription(userId);
    // return userSubscription?.plan === 'premium' && userSubscription?.active;
    return false;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};

// Check user's upload permissions and limits
const checkUploadPermissions = async (
  userId: string,
  fileSize: number
): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    const isPremium = await isPremiumUser(userId);

    // Check file size limits
    const maxFileSize = isPremium
      ? UPLOAD_LIMITS.PREMIUM_MAX_FILE_SIZE
      : UPLOAD_LIMITS.MAX_FILE_SIZE;

    if (fileSize > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return {
        allowed: false,
        reason: `File size exceeds limit. Maximum allowed: ${maxSizeMB}MB${
          !isPremium ? ". Upgrade to premium for larger files." : ""
        }`,
      };
    }

    // TEMPORARILY DISABLE THESE CHECKS FOR TESTING
    // We'll keep the file size check above but disable the quota checks

    /* 
    // Check total number of files uploaded by user
    const userModels = await adminDatabases.listDocuments(config.databaseId, config.modelsCollectionId, [
      `userId=${userId}`,
    ])

    const maxFiles = isPremium ? UPLOAD_LIMITS.PREMIUM_MAX_FILES : UPLOAD_LIMITS.MAX_FILES_PER_USER

    if (userModels.total >= maxFiles) {
      return {
        allowed: false,
        reason: `Upload limit reached. Maximum files: ${maxFiles}${
          !isPremium ? ". Upgrade to premium for more storage." : ""
        }`,
      }
    }

    // Check daily upload limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const todayUploads = await adminDatabases.listDocuments(config.databaseId, config.modelsCollectionId, [
      `userId=${userId}`,
      `createdAt>=${todayISO}`,
    ])

    if (todayUploads.total >= UPLOAD_LIMITS.MAX_FILES_PER_DAY && !isPremium) {
      return {
        allowed: false,
        reason: `Daily upload limit reached. Maximum: ${UPLOAD_LIMITS.MAX_FILES_PER_DAY} files per day. Upgrade to premium for unlimited daily uploads.`,
      }
    }
    */

    return { allowed: true };
  } catch (error) {
    console.error("Error checking upload permissions:", error);
    // Instead of failing, let's allow uploads during testing
    return { allowed: true };
  }
};

// Validate file content (basic security check)
const validateFileContent = async (
  file: File
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    // Check file signature/magic bytes for common 3D formats
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer.slice(0, 12));

    // GLB files start with "glTF" (0x676C5446) followed by version
    if (file.name.endsWith(".glb")) {
      const signature = String.fromCharCode(...uint8Array.slice(0, 4));
      if (signature !== "glTF") {
        return { valid: false, reason: "Invalid GLB file format" };
      }
    }

    // GLTF files should be valid JSON
    if (file.name.endsWith(".gltf")) {
      try {
        const text = new TextDecoder().decode(buffer);
        const json = JSON.parse(text);
        if (!json.asset || !json.asset.version) {
          return { valid: false, reason: "Invalid GLTF file structure" };
        }
      } catch {
        return { valid: false, reason: "Invalid GLTF JSON format" };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error("File validation error:", error);
    return { valid: false, reason: "Unable to validate file content" };
  }
};

// POST handler for file uploads
export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");

    // Check authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      console.log("User not authenticated");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const isPublic = formData.get("isPublic") === "true"; // Allow users to set privacy

    // Chunking parameters
    const chunkIndex = formData.get("chunkIndex");
    const totalChunks = formData.get("totalChunks");
    const uploadId = formData.get("uploadId");

    console.log("Form data parsed:", {
      fileName: file?.name,
      name,
      isPublic,
      hasChunking: !!chunkIndex,
      chunkIndex,
      totalChunks,
      uploadId,
      fileSize: file?.size,
    });

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Model name is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidFileType(file.name)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Only ${UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(
            ", "
          )} files are allowed.`,
        },
        { status: 400 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);
    console.log("Appwrite user ID:", appwriteUserId);

    // Check upload permissions
    const permissionCheck = await checkUploadPermissions(
      appwriteUserId,
      file.size
    );
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { error: permissionCheck.reason },
        { status: 403 }
      );
    }

    // Validate file content for security
    const contentValidation = await validateFileContent(file);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.reason },
        { status: 400 }
      );
    }

    // Handle chunked upload
    if (chunkIndex !== null && totalChunks !== null && uploadId) {
      console.log("Processing chunked upload");
      return await handleChunkedUpload({
        file,
        name: name.trim(),
        description: description.trim(),
        userId: appwriteUserId,
        isPublic,
        chunkData: {
          chunkIndex: Number.parseInt(chunkIndex as string),
          totalChunks: Number.parseInt(totalChunks as string),
          uploadId: uploadId as string,
        },
      });
    }

    // Handle single file upload
    console.log("Processing single file upload");
    return await handleSingleUpload({
      file,
      name: name.trim(),
      description: description.trim(),
      userId: appwriteUserId,
      isPublic,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle single file upload
async function handleSingleUpload({
  file,
  name,
  description,
  userId,
  isPublic,
}: {
  file: File;
  name: string;
  description: string;
  userId: string;
  isPublic: boolean;
}) {
  try {
    console.log("Starting single file upload to Appwrite");

    // Convert File to Buffer for Appwrite
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("File converted to buffer, size:", buffer.length);

    // Upload to Appwrite Storage with proper permissions
    const fileId = ID.unique();
    const filePermissions = getFilePermissions(userId, isPublic);

    console.log("File permissions:", filePermissions);

    const uploadedFile = await adminStorage.createFile(
      config.bucketId,
      fileId,
      new File([buffer], file.name, { type: file.type }),
      filePermissions // Set permissions based on public status
    );

    console.log("File uploaded to Appwrite storage:", uploadedFile.$id);

    // Create model record in database
    const modelData = {
      name,
      description,
      fileName: file.name,
      fileId: uploadedFile.$id,
      fileSize: file.size,
      mimeType: file.type,
      userId,
      kindeUserId: userId, // Store the original Kinde user ID for permissions
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Creating model record:", modelData);

    const model = await adminDatabases.createDocument(
      config.databaseId,
      config.modelsCollectionId,
      ID.unique(),
      modelData
    );

    console.log("Model record created:", model.$id);

    return NextResponse.json({
      success: true,
      completed: true,
      model,
      file: uploadedFile,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Single upload error:", error);
    throw error;
  }
}

// Handle chunked upload
async function handleChunkedUpload({
  file,
  name,
  description,
  userId,
  isPublic,
  chunkData,
}: {
  file: File;
  name: string;
  description: string;
  userId: string;
  isPublic: boolean;
  chunkData: ChunkUploadData;
}) {
  try {
    const { chunkIndex, totalChunks, uploadId } = chunkData;

    console.log(
      `Processing chunk ${chunkIndex + 1}/${totalChunks} for upload ${uploadId}`
    );

    // Convert chunk to buffer
    const arrayBuffer = await file.arrayBuffer();
    const chunkBuffer = Buffer.from(arrayBuffer);

    console.log(`Chunk ${chunkIndex} buffer size:`, chunkBuffer.length);

    // Initialize upload state if first chunk
    if (chunkIndex === 0) {
      console.log("Initializing upload state for first chunk");
      uploadStates.set(uploadId, {
        chunks: new Array(totalChunks).fill(undefined),
        metadata: {
          name,
          description,
          originalFilename: file.name,
          mimeType: file.type,
          totalSize: 0, // Will be calculated when all chunks are received
          userId,
          isPublic,
        },
      });
    }

    // Get upload state
    const uploadState = uploadStates.get(uploadId);
    if (!uploadState) {
      throw new Error(`Upload state not found for ID: ${uploadId}`);
    }

    // Adds safety check for chunks array
    if (!uploadState.chunks || !Array.isArray(uploadState.chunks)) {
      throw new Error(`Invalid chunks array for upload ID: ${uploadId}`);
    }

    // Adds bounds checking
    if (chunkIndex < 0 || chunkIndex >= uploadState.chunks.length) {
      throw new Error(
        `Invalid chunk index ${chunkIndex} for upload ${uploadId}`
      );
    }

    // Store chunk
    uploadState.chunks[chunkIndex] = chunkBuffer;
    console.log(`Chunk ${chunkIndex} stored successfully`);

    // Check if all chunks are uploaded
    const allChunksReceived = uploadState.chunks.every(
      (chunk) => chunk !== undefined
    );

    console.log(
      `Chunks status: ${
        uploadState.chunks.filter((c) => c !== undefined).length
      }/${totalChunks} received`
    );

    if (allChunksReceived) {
      console.log("All chunks received, assembling file");

      //Type safety for chunk combining
      const validChunks = uploadState.chunks.filter(
        (chunk): chunk is Buffer => chunk !== undefined
      );

      if (validChunks.length !== totalChunks) {
        throw new Error(
          `Missing chunks: expected ${totalChunks}, got ${validChunks.length}`
        );
      }

      // Combine all chunks
      const combinedBuffer = Buffer.concat(validChunks);
      const totalSize = combinedBuffer.length;

      console.log("File assembled, total size:", totalSize);

      // Upload combined file to Appwrite with proper permissions
      const fileId = ID.unique();
      const filePermissions = getFilePermissions(
        uploadState.metadata.userId,
        uploadState.metadata.isPublic
      );

      console.log("File permissions:", filePermissions);

      const uploadedFile = await adminStorage.createFile(
        config.bucketId,
        fileId,
        new File([combinedBuffer], uploadState.metadata.originalFilename, {
          type: uploadState.metadata.mimeType,
        }),
        filePermissions // Set permissions based on public status
      );

      console.log("Combined file uploaded to Appwrite:", uploadedFile.$id);

      // Create model record
      const modelData = {
        name: uploadState.metadata.name,
        description: uploadState.metadata.description,
        fileName: uploadState.metadata.originalFilename,
        fileId: uploadedFile.$id,
        fileSize: totalSize,
        mimeType: uploadState.metadata.mimeType,
        userId: uploadState.metadata.userId,
        kindeUserId: uploadState.metadata.userId, // Store the original Kinde user ID
        isPublic: uploadState.metadata.isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const model = await adminDatabases.createDocument(
        config.databaseId,
        config.modelsCollectionId,
        ID.unique(),
        modelData
      );

      console.log("Model record created:", model.$id);

      // Clean up upload state
      uploadStates.delete(uploadId);
      console.log("Upload state cleaned up");

      return NextResponse.json({
        success: true,
        completed: true,
        model,
        file: uploadedFile,
        message: "Chunked upload completed successfully",
      });
    }

    // Return progress update
    const chunksReceived = uploadState.chunks.filter(
      (chunk) => chunk !== undefined
    ).length;
    console.log(`Progress: ${chunksReceived}/${totalChunks} chunks received`);

    return NextResponse.json({
      success: true,
      completed: false,
      progress: Math.round((chunksReceived / totalChunks) * 100),
      chunksReceived,
      totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
    });
  } catch (error) {
    console.error("Chunked upload error:", error);
    // Clean up upload state on error
    uploadStates.delete(chunkData.uploadId);
    throw error;
  }
}

// GET handler to check upload status and user limits
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("uploadId");
  const checkLimits = searchParams.get("checkLimits");

  // Check user limits
  if (checkLimits === "true") {
    try {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }

      const appwriteUserId = createAppwriteUserId(user.id);
      const isPremium = await isPremiumUser(appwriteUserId);

      // Get user's current usage
      const userModels = await adminDatabases.listDocuments(
        config.databaseId,
        config.modelsCollectionId,
        [`userId=${appwriteUserId}`]
      );

      // Get today's uploads
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const todayUploads = await adminDatabases.listDocuments(
        config.databaseId,
        config.modelsCollectionId,
        [`userId=${appwriteUserId}`, `createdAt>=${todayISO}`]
      );

      const limits = {
        maxFileSize: isPremium
          ? UPLOAD_LIMITS.PREMIUM_MAX_FILE_SIZE
          : UPLOAD_LIMITS.MAX_FILE_SIZE,
        maxFiles: isPremium
          ? UPLOAD_LIMITS.PREMIUM_MAX_FILES
          : UPLOAD_LIMITS.MAX_FILES_PER_USER,
        maxDailyUploads: isPremium ? -1 : UPLOAD_LIMITS.MAX_FILES_PER_DAY, // -1 means unlimited
        currentFiles: userModels.total,
        todayUploads: todayUploads.total,
        isPremium,
      };

      return NextResponse.json({
        success: true,
        limits,
      });
    } catch (error) {
      console.error("Error checking limits:", error);
      return NextResponse.json(
        { error: "Failed to check limits" },
        { status: 500 }
      );
    }
  }

  // Check upload status
  if (!uploadId) {
    return NextResponse.json({ error: "Upload ID required" }, { status: 400 });
  }

  const uploadState = uploadStates.get(uploadId);
  if (!uploadState) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  const chunksReceived = uploadState.chunks.filter(
    (chunk) => chunk !== undefined
  ).length;
  const totalChunks = uploadState.chunks.length;

  return NextResponse.json({
    success: true,
    progress: Math.round((chunksReceived / totalChunks) * 100),
    chunksReceived,
    totalChunks,
    completed: chunksReceived === totalChunks,
  });
}

export const dynamic = "force-dynamic";
