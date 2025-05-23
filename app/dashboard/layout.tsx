import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Modelify",
  description: "Effortlessly showcase and interact with your 3D models",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            {children}
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </>
  );
}
