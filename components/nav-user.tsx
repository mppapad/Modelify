"use client";
import Link from "next/link";
import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { usePathname } from "next/navigation";

// Skeleton component for user avatar and info
const NavUserSkeleton = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div className="grid flex-1 text-left gap-1">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="ml-auto h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export function NavUser({}) {
  const { isMobile } = useSidebar();
  const { user, isLoading } = useKindeBrowserClient();

  // Default values in case first_name or last_name are undefined
  let firstInitial = "?";
  let lastInitial = "";

  if (user) {
    // Get first letter of first name (if available)
    if (user.given_name && user.given_name.length > 0) {
      firstInitial = user.given_name.charAt(0).toUpperCase();
    }

    // Get first letter of last name (if available)
    if (user.family_name && user.family_name.length > 0) {
      lastInitial = user.family_name.charAt(0).toUpperCase();
    }
  }
  const initials = firstInitial + lastInitial;

  const pathname = usePathname();
  const accountPath = "/dashboard/account"; // Use absolute path
  // If already on account page, prevent navigation or apply different styling
  const isActive = pathname === accountPath;

  // Show skeleton during loading
  if (isLoading || !user) {
    return <NavUserSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 ">
                <AvatarImage
                  src={user.picture || ""}
                  alt={`${user.given_name}'s profile`}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.given_name} {user.family_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-4xl">
                  <AvatarImage
                    src={user.picture || ""}
                    alt={`${user.given_name}'s profile`}
                  />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.given_name} {user.family_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={accountPath} passHref>
                <DropdownMenuItem>
                  <UserCircleIcon />
                  Account
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <LogoutLink>
              <DropdownMenuItem>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </LogoutLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
