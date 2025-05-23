"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import {
  Eye,
  Upload,
  Palette,
  Smartphone,
  Code,
  Zap,
  ArrowRight,
  Play,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Smooth scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      {/* Hero Section */}
      <main className="relative">
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/10 border border-border/40 backdrop-blur-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-200">
                Introducing Modelify
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
              Transform your{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                3D models
              </span>
              <br />
              into interactive experiences
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
              Upload your GLB files and instantly generate customizable 3D
              viewers with materials, lighting, and AR support. Perfect for
              e-commerce, portfolios, and presentations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up delay-300">
              <Button
                asChild
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full group"
              >
                <Link href="/live-demo" className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Try Live Demo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Preview/Demo Area */}
            <div className="relative max-w-4xl mx-auto animate-fade-in-up delay-500">
              <div className="relative rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-1 backdrop-blur-sm">
                <div className="rounded-2xl bg-black/40 p-8 border border-border/20">
                  <div className="aspect-video bg-muted/5 rounded-xl border border-border/20 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Interactive 3D Viewer Preview
                      </h3>
                      <p className="text-muted-foreground">
                        Your uploaded models come to life here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 border-t border-border/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need for{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  3D visualization
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to make 3D model integration seamless
                and professional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="group p-6 rounded-2xl bg-muted/5 border border-border/20 hover:border-purple-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Upload className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy Upload</h3>
                <p className="text-muted-foreground">
                  Simply drag and drop your GLB files. Our platform handles the
                  rest with automatic optimization.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 rounded-2xl bg-muted/5 border border-border/20 hover:border-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Palette className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Material Control</h3>
                <p className="text-muted-foreground">
                  Fine-tune materials, lighting, and textures with our intuitive
                  editor interface.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 rounded-2xl bg-muted/5 border border-border/20 hover:border-pink-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Smartphone className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AR Ready</h3>
                <p className="text-muted-foreground">
                  Built-in augmented reality support for mobile devices. View
                  models in real space.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 rounded-2xl bg-muted/5 border border-border/20 hover:border-green-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <Code className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Export Components
                </h3>
                <p className="text-muted-foreground">
                  Generate clean, customizable React components ready for your
                  projects.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-6 rounded-2xl bg-muted/5 border border-border/20 hover:border-yellow-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Optimized rendering with smooth 60fps performance across all
                  devices.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-6 rounded-2xl bg-muted/5 border border-border/20 hover:border-cyan-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Eye className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Interactive Viewers
                </h3>
                <p className="text-muted-foreground">
                  Built on model-viewer with enhanced controls for zoom, rotate,
                  and inspect.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-border/20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to bring your models to life?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of creators who trust Modelify for their 3D
                visualization needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 text-white  px-6"
                >
                  <LoginLink>Join now!</LoginLink>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .bg-grid-white\\/\\[0\\.02\\] {
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          );
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
