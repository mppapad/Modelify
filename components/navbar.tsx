"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { View, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useKindeBrowserClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-black/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/20">
              <View className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Modelify
            </span>
          </Link>

          {/* Centered Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection("features")}
              className="rounded-lg px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Features
            </button>
            <Link
              href="/live-demo"
              className="rounded-lg px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Demo
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-white text-black hover:bg-white/90 rounded-lg gap-1.5"
              >
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex bg-white text-black hover:bg-white/90 rounded-lg"
              >
                <LoginLink>Sign in</LoginLink>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="relative h-5 w-5">
                <Menu
                  className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
                    isMenuOpen
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
                    isMenuOpen
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="px-6 py-6">
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => scrollToSection("features")}
                className="flex items-center rounded-xl px-4 py-3.5 text-base text-white/70 transition-colors hover:bg-white/10 hover:text-white text-left"
              >
                Features
              </button>
              <Link
                href="/live-demo"
                className="flex items-center rounded-xl px-4 py-3.5 text-base text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </Link>
            </nav>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6">
              {isAuthenticated ? (
                <Button
                  asChild
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 gap-2"
                >
                  <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90"
                >
                  <LoginLink>Sign in</LoginLink>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
