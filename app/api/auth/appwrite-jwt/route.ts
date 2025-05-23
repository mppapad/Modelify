import { NextRequest, NextResponse } from "next/server";
import { createCustomJWT } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const jwt = await createCustomJWT();

    if (!jwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error("JWT creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
