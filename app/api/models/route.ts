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

    const { fileName, fileSize, fileType, name, description, isPublic } =
      await request.json();

    if (!fileName || !fileSize || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    if (fileSize > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 100MB" },
        { status: 400 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);
    const fileId = ID.unique();
    const documentId = ID.unique();

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

    // Pre-create the database document (we'll update it after upload)
    const document = await databases.createDocument(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      documentId,
      {
        name,
        description: description || "",
        fileId,
        fileName,
        fileSize,
        mimeType: fileType,
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

    // Return the upload details for client-side upload
    return NextResponse.json({
      fileId,
      documentId,
      bucketId: BUCKET_ID,
      permissions,
      uploadUrl: `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/v1/storage/buckets/${BUCKET_ID}/files`,
    });
  } catch (error: any) {
    console.error("Error creating upload URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload URL" },
      { status: 500 }
    );
  }
}

// app/api/models/upload-complete/route.ts
export async function PUT(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { documentId, fileId, success } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing document ID" },
        { status: 400 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);

    if (success) {
      // Update document with completion timestamp
      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        documentId,
        {
          updatedAt: new Date().toISOString(),
        }
      );

      return NextResponse.json({
        success: true,
        document: updatedDocument,
      });
    } else {
      // Upload failed, clean up
      try {
        // Delete the incomplete document
        await databases.deleteDocument(
          DATABASE_ID,
          MODELS_COLLECTION_ID,
          documentId
        );

        // Try to delete the file if it was created
        if (fileId) {
          try {
            await storage.deleteFile(BUCKET_ID, fileId);
          } catch (deleteError) {
            console.warn("Could not delete file:", deleteError);
          }
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      return NextResponse.json({
        success: false,
        message: "Upload failed and resources cleaned up",
      });
    }
  } catch (error: any) {
    console.error("Error completing upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete upload" },
      { status: 500 }
    );
  }
}
