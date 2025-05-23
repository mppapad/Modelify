import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default withAuth(async function middleware(req: NextRequest) {}, {
  // Public paths that don't require authentication
  publicPaths: ["/", "/live-demo"],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|glb|gltf|usdz)$).*)",
  ],
};
