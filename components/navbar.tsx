"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { View, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md">
        <div className=" flex h-16 items-center px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <View className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Modelify</span>
          </Link>

          {/* Centered Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Features
            </button>
            <Link
              href="/live-demo"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Demo
            </Link>
          </nav>

          {/* Right side - Always show button */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-white text-black hover:bg-white/90"
              >
                <Link href="/dashboard" className="flex items-center gap-1">
                  Dashboard
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-white text-black hover:bg-white/90"
              >
                <LoginLink>Sign in</LoginLink>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Absolutely positioned to break out of container */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 md:hidden border-b border-white/10 bg-black/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-6">
            <nav className="space-y-4">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-white/70 hover:text-white transition-colors py-2"
              >
                Features
              </button>
              <Link
                href="/live-demo"
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </Link>
            </nav>

            <div className="mt-6 pt-6 border-t border-white/10">
              {isAuthenticated ? (
                <Button
                  asChild
                  className="w-full bg-white text-black hover:bg-white/90"
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2"
                  >
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-white text-black hover:bg-white/90"
                >
                  <LoginLink>Sign in</LoginLink>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
