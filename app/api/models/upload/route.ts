import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  adminDatabases,
  adminStorage,
  config,
  createAppwriteUserId,
} from "@/lib/appwrite";
import { ID } from "appwrite";

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
  };
}

// In-memory storage for chunk assembly (in production, use Redis or database)
const uploadStates = new Map<string, UploadState>();

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

// Helper function to validate file type
const isValidFileType = (filename: string): boolean => {
  const allowedExtensions = ["glb", "usdz", "gltf"];
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
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

    // Chunking parameters
    const chunkIndex = formData.get("chunkIndex");
    const totalChunks = formData.get("totalChunks");
    const uploadId = formData.get("uploadId");

    console.log("Form data parsed:", {
      fileName: file?.name,
      name,
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
          error:
            "Invalid file type. Only .glb, .usdz, and .gltf files are allowed.",
        },
        { status: 400 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);
    console.log("Appwrite user ID:", appwriteUserId);

    // Handle chunked upload
    if (chunkIndex !== null && totalChunks !== null && uploadId) {
      console.log("Processing chunked upload");
      return await handleChunkedUpload({
        file,
        name: name.trim(),
        description: description.trim(),
        userId: appwriteUserId,
        chunkData: {
          chunkIndex: parseInt(chunkIndex as string),
          totalChunks: parseInt(totalChunks as string),
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
}: {
  file: File;
  name: string;
  description: string;
  userId: string;
}) {
  try {
    console.log("Starting single file upload to Appwrite");

    // Convert File to Buffer for Appwrite
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("File converted to buffer, size:", buffer.length);

    // Upload to Appwrite Storage
    const fileId = ID.unique();
    const uploadedFile = await adminStorage.createFile(
      config.bucketId,
      fileId,
      new File([buffer], file.name, { type: file.type })
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
      isPublic: true,
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
  chunkData,
}: {
  file: File;
  name: string;
  description: string;
  userId: string;
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

      // Upload combined file to Appwrite
      const fileId = ID.unique();
      const uploadedFile = await adminStorage.createFile(
        config.bucketId,
        fileId,
        new File([combinedBuffer], uploadState.metadata.originalFilename, {
          type: uploadState.metadata.mimeType,
        })
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
        isPublic: true,
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

// GET handler to check upload status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("uploadId");

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
