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

    if (!file || !name) {
      return NextResponse.json(
        { error: "Missing required fields: file or name" },
        { status: 400 }
      );
    }

    // VERCEL LIMIT: Only allow smaller files through API route
    // Larger files should use direct client upload
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit for API route
      return NextResponse.json(
        {
          error:
            "File too large for API upload. Please use direct upload for files over 10MB.",
          useDirectUpload: true,
        },
        { status: 413 }
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

    const appwriteUserId = createAppwriteUserId(user.id);
    const fileId = ID.unique();

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
      file,
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
        kindeUserId: document.kindeUserId,
        isPublic: document.isPublic,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific Appwrite errors
    if (error instanceof Error) {
      if (error.message.includes("file_size_exceeded")) {
        return NextResponse.json(
          {
            error: "File size exceeds the maximum allowed limit.",
            useDirectUpload: true,
          },
          { status: 413 }
        );
      }

      if (error.message.includes("storage_file_type_unsupported")) {
        return NextResponse.json(
          {
            error:
              "File type not supported. Please upload .glb, .usdz, or .gltf files only.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error during upload" },
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
