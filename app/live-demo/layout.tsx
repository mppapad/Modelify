import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modelify - View Model",
  description: "View and interact with 3D models",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* NO AuthProvider here - this is public */}
      <ThemeProvider defaultTheme="light" storageKey="">
        <div className="min-h-screen bg-white">{children}</div>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
