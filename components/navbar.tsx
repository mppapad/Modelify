"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { View } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full  px-4 py-2.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-1">
          <View size={28} color="#000000" strokeWidth={0.75} />
          <span className="text-xl font-normal text-gray-800"> Modelify</span>
        </Link>
        <div className="flex items-center space-x-4">
          <LoginLink className=" inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs h-9 px-4 py-2  bg-indigo-600 hover:bg-indigo-400">
            Sign in
          </LoginLink>
        </div>
      </div>
    </nav>
  );
}
