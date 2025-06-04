"use client";

import type React from "react";

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
  PieChartIcon as ChartPie,
  Pause,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9); // Default to 16:9

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video events to sync state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

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

  // Handle video metadata loaded to get aspect ratio
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      if (videoWidth && videoHeight) {
        setVideoAspectRatio(videoWidth / videoHeight);
      }
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
                onClick={() => scrollToSection("features")}
              >
                <div className="">
                  <Eye className="w-4 h-4" />
                  Explore Features
                </div>
              </Button>
            </div>

            {/* Preview Area */}
            <div className="relative max-w-4xl mx-auto animate-fade-in-up delay-500">
              <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 md:p-8">
                <div
                  ref={videoContainerRef}
                  className="bg-neutral-950 rounded-md border border-neutral-800 overflow-hidden relative group"
                  style={{ aspectRatio: videoAspectRatio }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src="/preview.mp4"
                      className="w-full h-full object-contain"
                      autoPlay
                      loop
                      muted
                      playsInline
                      onClick={togglePlayPause}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                    />
                  </div>

                  {/* Custom Play/Pause Overlay - Always visible on mobile, visible on hover for desktop */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      isMobile
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    } transition-opacity duration-300 bg-black/20 touch-none`}
                  >
                    <button
                      onClick={togglePlayPause}
                      className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 md:p-4 transition-colors touch-auto"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 md:w-8 md:h-8" />
                      ) : (
                        <Play className="w-6 h-6 md:w-8 md:h-8" />
                      )}
                    </button>
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
                  title: "Multiple Materials",
                  description:
                    "View all the materials inside your model. in 3D and AR.",
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
                    "Generate clean iframes for your models for easy embedding in websites and apps.",
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description:
                    "Optimized rendering for performance and efficiency.",
                },
                {
                  icon: ChartPie,
                  title: "Analytics",
                  description:
                    "View detailed analytics on model interactions, including views, time spent, and more.",
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
                Join Modelify for your 3D visualization needs.
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
        <div className="flex justify-center items-center mx-auto px-4 ">
          {" "}
          <Footer></Footer>
        </div>
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
