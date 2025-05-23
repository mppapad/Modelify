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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "true"; // Optional: let users choose

    if (!file || !name) {
      return NextResponse.json(
        { error: "Missing required fields: file or name" },
        { status: 400 }
      );
    }

    const appwriteUserId = createAppwriteUserId(user.id);
    const fileId = ID.unique();

    // Create permissions array - user always has full access
    const permissions = [
      Permission.read(Role.user(appwriteUserId)),
      Permission.write(Role.user(appwriteUserId)),
      Permission.update(Role.user(appwriteUserId)),
      Permission.delete(Role.user(appwriteUserId)),
    ];

    // Add public read permission if desired (for public components)
    if (isPublic) {
      permissions.push(Permission.read(Role.guests()));
      permissions.push(Permission.read(Role.users())); // For logged-in users too
    }

    // Upload file with proper permissions
    const uploadedFile = await storage.createFile(
      BUCKET_ID,
      fileId,
      file,
      permissions
    );

    // Create document in database with matching permissions
    const document = await databases.createDocument(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      ID.unique(),
      {
        name,
        description,
        fileId: uploadedFile.$id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        userId: appwriteUserId,
        kindeUserId: user.id,
        isPublic: isPublic || false,
        createdAt: new Date().toISOString(),
      },
      // Database document permissions (separate from file permissions)
      [
        Permission.read(Role.user(appwriteUserId)),
        Permission.write(Role.user(appwriteUserId)),
        Permission.update(Role.user(appwriteUserId)),
        Permission.delete(Role.user(appwriteUserId)),
        // Add public read for document metadata if file is public
        ...(isPublic
          ? [Permission.read(Role.guests()), Permission.read(Role.users())]
          : []),
      ]
    );

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Error uploading model:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload model" },
      { status: 500 }
    );
  }
}
