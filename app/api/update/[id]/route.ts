import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite";
import { cookies } from "next/headers";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const MODELS_COLLECTION_ID = process.env.NEXT_PUBLIC_MODELS_COLLECTION_ID!;

interface UpdateModelRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { id: modelId } = await params;

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    // Get the session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("appwrite-session");

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UpdateModelRequest = await request.json();
    const { name, description, isPublic } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Model name is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Model name must be less than 100 characters" },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Model description must be less than 500 characters" },
        { status: 400 }
      );
    }

    // First, verify the model exists and get current data
    try {
      const existingModel = await databases.getDocument(
        DATABASE_ID,
        MODELS_COLLECTION_ID,
        modelId
      );

      if (!existingModel) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      // Optional: Verify user ownership
      // const currentUserId = await getCurrentUserId(sessionToken);
      // if (existingModel.userId !== currentUserId) {
      //   return NextResponse.json(
      //     { error: "Unauthorized - you can only update your own models" },
      //     { status: 403 }
      //   );
      // }
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as Error).message;
        if (
          errorMessage?.includes(
            "Document with the requested ID could not be found"
          )
        ) {
          return NextResponse.json(
            { error: "Model not found" },
            { status: 404 }
          );
        }
      }
      throw error;
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (isPublic !== undefined) {
      updateData.isPublic = Boolean(isPublic);
    }

    // Update the model document
    const updatedModel = await databases.updateDocument(
      DATABASE_ID,
      MODELS_COLLECTION_ID,
      modelId,
      updateData
    );

    return NextResponse.json(
      {
        success: true,
        message: "Model updated successfully",
        model: {
          id: updatedModel.$id,
          name: updatedModel.name,
          description: updatedModel.description,
          isPublic: updatedModel.isPublic,
          updatedAt: updatedModel.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in update model API:", error);

    // Handle specific Appwrite errors
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = (error as Error).message;

      if (
        errorMessage.includes(
          "Document with the requested ID could not be found"
        )
      ) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      if (errorMessage.includes("Missing required parameter")) {
        return NextResponse.json(
          { error: "Invalid request parameters" },
          { status: 400 }
        );
      }

      if (errorMessage.includes("Invalid `name` param")) {
        return NextResponse.json(
          { error: "Invalid model name provided" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error occurred while updating model",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
