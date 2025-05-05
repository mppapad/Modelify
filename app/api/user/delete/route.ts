import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function DELETE(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    // Verify the user is deleting their own account
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Here you would:
    // 1. Delete the user's data from your database
    // 2. Potentially call Kinde's API to delete the user there as well

    // Example pseudo-code:
    // await prisma.user.delete({
    //   where: { id: userId },
    // });

    // For Kinde, you might want to delete the user there too
    // This would require using Kinde's Management API

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
