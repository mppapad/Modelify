import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const userId = formData.get("userId") as string;

    // Verify the user is updating their own profile
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Here you would:
    // 1. Upload the image to a storage service (S3, Cloudinary, etc.)
    // 2. Get the URL of the uploaded image
    // 3. Update the user's profile in your database with the new image URL

    // Example pseudo-code:
    // const imageUrl = await uploadToStorage(image);
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { imageUrl },
    // });

    // For Kinde, you might want to update the user's picture there too
    // This would require using Kinde's Management API

    return NextResponse.json(
      { message: "Profile picture updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update profile picture:", error);
    return NextResponse.json(
      { error: "Failed to update profile picture" },
      { status: 500 }
    );
  }
}
