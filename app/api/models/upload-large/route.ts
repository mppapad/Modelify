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

// This route handles large file uploads using server-side Appwrite client
// It processes the upload in chunks to avoid Vercel function timeouts
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

    // Check file size (allow up to 100MB for this route)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit." },
        { status: 413 }
      );
    }

    console.log(`Processing upload: ${file.name} (${file.size} bytes)`);

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

    try {
      // Upload file to Appwrite Storage using server client (with API key)
      console.log(
        "Starting file upload to Appwrite with server credentials..."
      );

      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        fileId,
        file,
        permissions
      );

      console.log("File uploaded successfully:", uploadedFile.$id);

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

      console.log("Document created successfully:", document.$id);

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
    } catch (uploadError: any) {
      console.error("Appwrite upload error:", uploadError);

      // Handle specific Appwrite errors
      if (uploadError.message?.includes("file_size_exceeded")) {
        return NextResponse.json(
          { error: "File size exceeds the maximum allowed limit." },
          { status: 413 }
        );
      }

      if (uploadError.message?.includes("storage_file_type_unsupported")) {
        return NextResponse.json(
          {
            error:
              "File type not supported. Please upload .glb, .usdz, or .gltf files only.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload handler error:", error);
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
