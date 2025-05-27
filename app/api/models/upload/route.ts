import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  databases,
  storage,
  DATABASE_ID,
  MODELS_COLLECTION_ID,
  BUCKET_ID,
} from "@/lib/appwrite-server";
import { createAppwriteUserId } from "@/lib/appwrite";
import { ID, Permission, Role } from "node-appwrite";

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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "true";
    const chunkIndex = parseInt((formData.get("chunkIndex") as string) || "0");
    const totalChunks = parseInt(
      (formData.get("totalChunks") as string) || "1"
    );
    const uploadId = formData.get("uploadId") as string;

    if (!file || !name) {
      return NextResponse.json(
        { error: "Missing required fields: file or name" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [".glb", ".usdz", ".gltf"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.some((type) => fileExtension === type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload .glb, .usdz, or .gltf files only.",
        },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit" },
        { status: 413 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);

    // For single chunk (small files) or final chunk
    if (totalChunks === 1 || chunkIndex === totalChunks - 1) {
      const fileId = uploadId || ID.unique();

      // Create permissions array
      const permissions = [
        Permission.read(Role.user(appwriteUserId)),
        Permission.write(Role.user(appwriteUserId)),
        Permission.update(Role.user(appwriteUserId)),
        Permission.delete(Role.user(appwriteUserId)),
      ];

      // Add public permissions if needed
      if (isPublic) {
        permissions.push(Permission.read(Role.guests()));
        permissions.push(Permission.read(Role.users()));
      }

      // Upload file to Appwrite Storage
      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        fileId,
        file, // Pass the File object directly
        permissions
      );

      // Create document in database
      const document = await databases.createDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        ID.unique(),
        {
          name,
          description: description || "",
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          userId: appwriteUserId,
          kindeUserId: user.id,
          isPublic: isPublic || false,
          createdAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.user(appwriteUserId)),
          Permission.write(Role.user(appwriteUserId)),
          Permission.update(Role.user(appwriteUserId)),
          Permission.delete(Role.user(appwriteUserId)),
          ...(isPublic
            ? [Permission.read(Role.guests()), Permission.read(Role.users())]
            : []),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Model uploaded successfully",
        document: {
          id: document.$id,
          name: document.name,
          description: document.description,
          fileId: document.fileId,
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          userId: document.userId,
          isPublic: document.isPublic,
          createdAt: document.createdAt,
        },
      });
    } else {
      // For chunked upload (if you want to implement it later)
      return NextResponse.json({
        success: true,
        message: "Chunk uploaded successfully",
        chunkUploaded: chunkIndex + 1,
        totalChunks,
        uploadId: uploadId || ID.unique(),
      });
    }
  } catch (error: any) {
    console.error("Error uploading model:", error);

    // More specific error handling
    let statusCode = 500;
    let errorMessage = error.message || "Failed to upload model";

    if (error.code) {
      switch (error.code) {
        case 400:
          statusCode = 400;
          errorMessage = "Invalid file format or data";
          break;
        case 401:
          statusCode = 401;
          errorMessage = "Authentication required";
          break;
        case 403:
          statusCode = 403;
          errorMessage = "Permission denied";
          break;
        case 413:
          statusCode = 413;
          errorMessage = "File too large";
          break;
        case 429:
          statusCode = 429;
          errorMessage = "Too many requests. Please try again later.";
          break;
      }
    }

    // Handle specific Appwrite errors
    if (error.message?.includes("Invalid file type")) {
      statusCode = 400;
      errorMessage =
        "Invalid file type. Please upload .glb, .usdz, or .gltf files only.";
    } else if (error.message?.includes("file size")) {
      statusCode = 413;
      errorMessage = "File size exceeds the maximum limit of 100MB.";
    } else if (error.message?.includes("storage")) {
      statusCode = 500;
      errorMessage = "Storage service error. Please try again later.";
    } else if (error.message?.includes("database")) {
      statusCode = 500;
      errorMessage = "Database error. Please try again later.";
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// Configuration for handling large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Set desired value here
    },
  },
  // Important: Increase function timeout for large uploads
  maxDuration: 300, // 5 minutes
};
