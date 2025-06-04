import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  // Define public paths that should bypass authentication
  const publicPaths = ["/", "/live-demo"];

  // Define paths that should be public with pattern matching
  const isViewRoute = req.nextUrl.pathname.startsWith("/view/");
  const isRecordViewAPI = req.nextUrl.pathname.startsWith(
    "/api/models/record-view/"
  );
  const isViewAPI = req.nextUrl.pathname.startsWith("/api/models/view/");
  const isMetadataAPI = req.nextUrl.pathname.startsWith(
    "/api/models/metadata/"
  );
  const isAuthAPI = req.nextUrl.pathname.startsWith("/api/auth/");

  // If it's a public route, allow it to proceed
  if (
    publicPaths.includes(req.nextUrl.pathname) ||
    isViewRoute ||
    isRecordViewAPI ||
    isViewAPI ||
    isMetadataAPI ||
    isAuthAPI
  ) {
    console.log("✅ Allowing public access to:", req.nextUrl.pathname);
    return NextResponse.next();
  }

  // For all other routes, use Kinde auth
  console.log("🔒 Checking auth for:", req.nextUrl.pathname);

  // Use withAuth as a middleware wrapper
  return withAuth(req, {
    publicPaths: [], // Empty since we handle public paths above
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|glb|gltf|usdz)$).*)",
  ],
};
