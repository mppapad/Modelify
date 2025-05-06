"use client";

import { useEffect, useState } from "react";
import { ConstructionIcon } from "lucide-react"; // Assuming you have a construction icon
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

export default function AnalyticsPage() {
  useEffect(() => {
    document.title = "Modelify | Analytics (Under Construction)";
  }, []);

  const [loading, setLoading] = useState(true);

  // Simulate initial loading (like fetching permissions or user data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            {loading ? (
              <>
                <Skeleton className="h-8 w-52 mb-2" />
                <Skeleton className="h-4 w-72" />
              </>
            ) : (
              <>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ConstructionIcon className="w-6 h-6" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  This section is currently under construction. We're working
                  hard to bring you the best analytics experience.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                We appreciate your patience. Stay tuned for updates!
              </p>
            )}
          </CardContent>

          <CardFooter className="flex justify-end">
            {loading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <Button
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => alert("Thank you for your interest!")}
              >
                Notify Me
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
