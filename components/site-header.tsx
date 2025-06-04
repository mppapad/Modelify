"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Navigation data for path to title mapping
const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/models": "Models",
  "/dashboard/analytics": "Analytics",
  "/dashboard/trash": "Recycling Bin",
  "/dashboard/docs": "Knowledge Base",
  "/dashboard/help": "Get Help",
  "/dashboard/account": "Account",
  "/dashboard/upload": "Upload",
  // Add additional paths here as needed
};

// Helper function to get the most specific matching path
function getBestMatchingTitle(pathname: string): string {
  // First try exact match
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  // If no exact match, try to find the most specific parent path
  // Sort paths by length (longest/most specific first)
  const paths = Object.keys(routeTitles).sort((a, b) => b.length - a.length);

  for (const path of paths) {
    if (pathname.startsWith(path)) {
      return routeTitles[path];
    }
  }

  // Default fallback if no match found
  return "Dashboard";
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = getBestMatchingTitle(pathname);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto"></div>
      </div>
    </header>
  );
}
