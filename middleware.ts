import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
//@ts-ignore
export default withAuth(async function middleware(req) {}, {
  // Middleware still runs on all routes, but doesn't protect the blog route
  publicPaths: ["/", "/live-demo"],
});

export const config = {
  matcher: [
    // This pattern will match all routes except _next, static files, and now also 3D model files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest?|glb|gltf|usdz)).*)",
  ],
};
