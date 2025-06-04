"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  className,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  className?: string;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <Link
                  href={item.url}
                  onClick={(e) => {
                    if (isActive) e.preventDefault();
                    // Close sidebar on mobile when clicking a navigation item
                    if (isMobile) setOpenMobile(false);
                  }}
                  className="w-full"
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      isActive ? "bg-accent text-accent-foreground" : ""
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
