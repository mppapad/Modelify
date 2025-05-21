"use client";

import { View } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
      <div className="flex items-center gap-2 text-2xl font-bold text-black mb-4">
        <View className="w-6 h-6 text-black" />
        Modelify
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Button
        className="bg-black text-white hover:bg-gray-800"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Go back to Dashboard
      </Button>
    </div>
  );
}
