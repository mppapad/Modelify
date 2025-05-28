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

    // Validate file type
    const allowedTypes = [".glb", ".usdz", ".gltf"];
    const fileExtension = "." + fileName.split(".").pop()?.toLowerCase();

    if (!allowedTypes.some((type) => fileExtension === type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload .glb, .usdz, or .gltf files only.",
        },
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
        status: "uploading", // Track upload status
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
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error("Error creating upload URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload URL" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
