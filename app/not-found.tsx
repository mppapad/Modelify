"use client";

import { View } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6 text-center">
      <div className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
        <View className="w-6 h-6 text-white" />
        Modelify
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Button
        className="bg-white text-black hover:bg-gray-200"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Go back to Dashboard
      </Button>
    </div>
  );
}
