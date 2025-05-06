"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BarChart, LineChart, PieChart, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  useEffect(() => {
    document.title = "Modelify | Analytics";
  }, []);
  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState("Unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for 1.5 seconds
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Progress animation
    const timer = setTimeout(() => {
      setProgress((prevProgress) => {
        if (prevProgress < 5) {
          return prevProgress + 1;
        }
        return prevProgress;
      });
    }, 100);

    // Calculate a random number of days remaining (10-30)
    setDaysRemaining(Math.floor(Math.random() * 20 + 10).toString());

    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
    };
  }, [progress]);

  // Background blurred shapes
  const BlurredShapes = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-1/4 -left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
      <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    </div>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6 w-full">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <BlurredShapes />

      <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </CardTitle>
          <CardDescription className="text-xl mt-2">
            Under Construction
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <BarChart className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>

                <p className="text-center text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  We're building something amazing! Our analytics dashboard is
                  currently under development and will be ready soon.
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Estimated completion: {daysRemaining} days remaining
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Development Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <LineChart className="w-8 h-8 text-blue-500" />
                  <span className="mt-2 text-sm">Metrics</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <PieChart className="w-8 h-8 text-emerald-500" />
                  <span className="mt-2 text-sm">Reports</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Database className="w-8 h-8 text-amber-500" />
                  <span className="mt-2 text-sm">Data</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <BarChart className="w-8 h-8 text-purple-500" />
                  <span className="mt-2 text-sm">Insights</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
