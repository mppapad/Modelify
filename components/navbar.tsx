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

  // Smooth scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className="sticky top-0 z-50 w-full  border-border/40 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo/Brand and Desktop Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-xl bg-purple-600/10 group-hover:bg-purple-600/20 transition-colors">
              <View size={24} className="text-purple-400" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-semibold text-white">Modelify</span>
          </Link>

          {/* Desktop Navigation - moved next to logo */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-m text-white hover:text-black transition-colors cursor-pointer hover:border-[0.25px] hover:bg-neutral-200 rounded-lg border-neutral-700 py-1 px-2"
            >
              Features
            </button>
            <Link
              href="/live-demo"
              className="text-m text-white hover:text-black transition-colors cursor-pointer hover:border-[0.25px] hover:bg-neutral-200 rounded-lg border-neutral-700 py-1 px-2"
            >
              Demo
            </Link>
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white  px-6"
          >
            <LoginLink>Sign in</LoginLink>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <Menu size={24} className="text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-black/95 backdrop-blur">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection("features")}
              className="block text-lg text-white hover:text-purple-700 transition-colors py-2 w-full  hover:bg-purple-700 rounded-lg text-center border-[0.25px] border-neutral-700"
            >
              Features
            </button>
            <Link
              href="/live-demo"
              className="block text-white hover:text-purple-700 transition-colors py-2 text-lg rounded-lg text-center border-[0.25px] border-neutral-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </Link>
            <div className="pt-4 border-t border-border/20 space-y-3">
              <Button
                asChild
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              >
                <LoginLink> Sign in</LoginLink>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
