import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Eye } from "lucide-react";
export default function HeroSection() {
  return (
    <>
      <Navbar />
      <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      </div>
      <div className="relative mx-auto h-screen w-full max-w-7xl px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between py-8"></div>
        <div className="pt-8">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <div className="mb-8 flex">
              <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a9a9a9_0%,#0c0c0c_50%,#a9a9a9_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#171717_0%,#737373_50%,#171717_100%)]" />
                <div className="inline-flex h-full w-full justify-center rounded-full bg-white px-3 py-1 text-xs font-medium leading-5 text-slate-600 backdrop-blur-xl dark:bg-black dark:text-slate-200">
                  Introducing Modelify
                </div>
              </span>
            </div>
            <h2 className="text-center text-4xl font-medium text-gray-900 dark:text-gray-50 sm:text-6xl">
              Watch your products,{" "}
              <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-indigo-600 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
                come to life
              </span>
            </h2>
            <p className="mt-6 text-center text-md leading-6 text-gray-600 dark:text-gray-200">
              Effortlessly showcase and interact with your 3D models, directly
              in your website with seamless{" "}
              <span className="opacity-90 text-indigo-600">AR</span> support.
            </p>
            <Button asChild className="m-10 bg-indigo-600 hover:bg-indigo-400">
              <Link href="/live-demo">
                {" "}
                <span className="text-xl font-normal text-gray-800">
                  {" "}
                  <Eye size={28} color="#ffffff" strokeWidth={2} />
                </span>
                Live Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
