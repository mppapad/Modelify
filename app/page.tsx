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
  ChevronUp,
  Star,
  Users,
  Download,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

      {/* Subtle Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Hero Section */}
      <main className="relative">
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Simple Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-neutral-400">
                Introducing Modelify v1.0
              </span>
            </div>

            {/* Clean Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9] animate-fade-in-up tracking-tight">
              Transform your <span className="text-neutral-400">3D models</span>
              <br />
              into interactive experiences
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-neutral-400 max-w-4xl mx-auto mb-8 leading-relaxed animate-fade-in-up delay-200">
              Upload your GLB files and instantly generate customizable 3D
              viewers with materials, lighting, and AR support.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 text-neutral-500">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium text-white">10,000+</span>
                <span className="text-sm">creators</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium text-white">50,000+</span>
                <span className="text-sm">models processed</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-white">4.9/5</span>
                <span className="text-sm">rating</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-fade-in-up delay-400">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-md font-medium transition-colors"
              >
                <Link href="/live-demo" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Try Live Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-neutral-800 bg-transparent hover:bg-neutral-900 text-white px-8 py-3 rounded-md font-medium transition-colors"
              >
                <Link href="#features" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Explore Features
                </Link>
              </Button>
            </div>

            {/* Preview Area */}
            <div className="relative max-w-4xl mx-auto animate-fade-in-up delay-500">
              <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-8">
                <div className="aspect-video bg-neutral-950 rounded-md border border-neutral-800 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-neutral-300">
                      Interactive 3D Viewer Preview
                    </h3>
                    <p className="text-neutral-500 text-sm">
                      Your uploaded models come to life here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                Everything you need for{" "}
                <span className="text-neutral-400">3D visualization</span>
              </h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Powerful features designed to make 3D model integration seamless
                and professional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Upload,
                  title: "Drag & Drop Upload",
                  description:
                    "Simply drag and drop your GLB files. Our platform handles optimization and format conversion automatically.",
                },
                {
                  icon: Palette,
                  title: "Material Editor",
                  description:
                    "Fine-tune materials, lighting, textures, and environmental effects with our intuitive editor interface.",
                },
                {
                  icon: Smartphone,
                  title: "AR Ready",
                  description:
                    "Built-in augmented reality support for mobile devices. View models in real space with WebXR.",
                },
                {
                  icon: Code,
                  title: "Export Components",
                  description:
                    "Generate clean, customizable React components with TypeScript support, ready for production.",
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description:
                    "Optimized rendering with smooth 60fps performance and automatic LOD management.",
                },
                {
                  icon: Globe,
                  title: "Global CDN",
                  description:
                    "Worldwide content delivery network ensures fast loading times from anywhere.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-neutral-700 transition-colors">
                    <feature.icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                Ready to bring your models to life?
              </h2>
              <p className="text-lg text-neutral-400 mb-8">
                Join thousands of creators who trust Modelify for their 3D
                visualization needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-md font-medium"
                >
                  <LoginLink>Get Started</LoginLink>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-neutral-800 bg-transparent hover:bg-neutral-900 text-white px-8 py-3 rounded-md font-medium"
                >
                  <Link href="/live-demo">View Demo</Link>
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
          className="fixed bottom-6 right-6 z-50 p-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md border border-neutral-800 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4" />
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
