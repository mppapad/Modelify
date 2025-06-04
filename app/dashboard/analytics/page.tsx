"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Eye,
  Download,
  Users,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  FileText,
  Clock,
  TrendingUp,
  Tablet,
  ComputerIcon as Device,
} from "lucide-react";
import { format, subDays } from "date-fns";

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalDownloads: number;
    uniqueVisitors: number;
    avgViewTime: number;
    topModel: string;
    growthRate: number;
  };
  viewsOverTime: Array<{
    date: string;
    views: number;
    downloads: number;
    uniqueVisitors: number;
  }>;
  topModels: Array<{
    name: string;
    views: number;
    downloads: number;
    fileType: string;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    modelName: string;
    timestamp: string;
    userAgent: string;
    country: string;
  }>;
}

// Simple chart configuration
const chartConfig = {
  views: {
    label: "Views",
    color: "#6366f1",
  },
  downloads: {
    label: "Downloads",
    color: "#8b5cf6",
  },
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = "Modelify | Analytics";
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await response.json();
      console.log("Analytics data received:", analyticsData);
      setData(analyticsData);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
      // Use mock data as fallback
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): AnalyticsData => {
    const days = Number.parseInt(timeRange.replace("d", ""));
    const viewsOverTime = Array.from({ length: days }, (_, i) => {
      const date = format(subDays(new Date(), days - 1 - i), "MMM dd");
      return {
        date,
        views: Math.floor(Math.random() * 100) + 20,
        downloads: Math.floor(Math.random() * 20) + 5,
        uniqueVisitors: Math.floor(Math.random() * 50) + 10,
      };
    });

    return {
      overview: {
        totalViews: 12847,
        totalDownloads: 2341,
        uniqueVisitors: 8923,
        avgViewTime: 145,
        topModel: "Gaming Chair Pro",
        growthRate: 23.5,
      },
      viewsOverTime,
      topModels: [
        {
          name: "Gaming Chair Pro",
          views: 2341,
          downloads: 456,
          fileType: "GLB",
        },
        { name: "Modern Lamp", views: 1987, downloads: 234, fileType: "GLTF" },
        { name: "Coffee Table", views: 1654, downloads: 189, fileType: "GLB" },
        {
          name: "Bookshelf Unit",
          views: 1432,
          downloads: 167,
          fileType: "USDZ",
        },
        { name: "Office Desk", views: 1298, downloads: 145, fileType: "GLB" },
      ],
      deviceBreakdown: [
        { device: "Desktop", count: 5234, percentage: 45.2 },
        { device: "Mobile", count: 4567, percentage: 39.4 },
        { device: "Tablet", count: 1789, percentage: 15.4 },
      ],
      geographicData: [
        { country: "United States", views: 3456, percentage: 28.5 },
        { country: "United Kingdom", views: 2134, percentage: 17.6 },
        { country: "Germany", views: 1876, percentage: 15.4 },
        { country: "Canada", views: 1234, percentage: 10.2 },
        { country: "Australia", views: 987, percentage: 8.1 },
      ],
      recentActivity: [
        {
          id: "1",
          action: "View",
          modelName: "Gaming Chair Pro",
          timestamp: "2 minutes ago",
          userAgent: "Chrome on Windows",
          country: "US",
        },
        {
          id: "2",
          action: "Download",
          modelName: "Modern Lamp",
          timestamp: "5 minutes ago",
          userAgent: "Safari on iPhone",
          country: "UK",
        },
        {
          id: "3",
          action: "View",
          modelName: "Coffee Table",
          timestamp: "8 minutes ago",
          userAgent: "Firefox on Mac",
          country: "CA",
        },
      ],
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Desktop":
        return <Monitor className="w-4 h-4 text-muted-foreground" />;
      case "Mobile":
        return <Smartphone className="w-4 h-4 text-muted-foreground" />;
      case "Tablet":
        return <Tablet className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Device className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                <Skeleton className="h-3 sm:h-4 w-3 sm:w-4 rounded-full" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-2" />
                <Skeleton className="h-2 sm:h-3 w-20 sm:w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Using mock data for demonstration. Your analytics tracking is set
              up and will populate as users interact with your models.
            </p>
            <Button onClick={fetchAnalytics} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your 3D model performance and engagement
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(data?.overview.totalViews || 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">
                +{data?.overview.growthRate || 0}%
              </span>{" "}
              <span className="hidden sm:inline">from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(data?.overview.totalDownloads || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((data?.overview.totalDownloads || 0) /
                  (data?.overview.totalViews || 1)) *
                100
              ).toFixed(1)}
              % conv.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(data?.overview.uniqueVisitors || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((data?.overview.uniqueVisitors || 0) /
                  (data?.overview.totalViews || 1)) *
                100
              ).toFixed(1)}
              % unique
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              View Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">
              {data?.overview.avgViewTime || 0}s
            </div>
            <p className="text-xs text-muted-foreground">Avg. time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Views Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Views & Downloads Over Time</CardTitle>
            <CardDescription>
              Daily performance for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[200px] sm:h-[300px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={data?.viewsOverTime || []}
                  width={300}
                  height={200}
                  margin={{
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 6)}
                    fontSize={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <defs>
                    <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-views)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-views)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillDownloads"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-downloads)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-downloads)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="downloads"
                    type="monotone"
                    fill="url(#fillDownloads)"
                    fillOpacity={0.4}
                    stroke="var(--color-downloads)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="views"
                    type="monotone"
                    fill="url(#fillViews)"
                    fillOpacity={0.4}
                    stroke="var(--color-views)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>How users access your models</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center">
            <div className="h-[200px] sm:h-[300px] w-full max-w-[250px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart width={250} height={200}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={
                      data?.deviceBreakdown?.filter((item) => item.count > 0) ||
                      []
                    }
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#a855f7" />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Models Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Models</CardTitle>
          <CardDescription>
            Your most viewed and downloaded 3D models
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[250px] sm:h-[350px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                accessibilityLayer
                data={data?.topModels || []}
                width={300}
                height={250}
                margin={{
                  top: 20,
                  left: 20,
                  right: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 6 ? value.slice(0, 6) + "..." : value
                  }
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                <Bar
                  dataKey="downloads"
                  fill="var(--color-downloads)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Geographic Data */}
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Geographic Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Where your viewers are located
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {(data?.geographicData || []).map((country, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base">
                      {country.country}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm sm:text-base">
                      {formatNumber(country.views)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {country.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Device Types</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Breakdown by device category
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {(data?.deviceBreakdown || []).map((device, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.device)}
                    <span className="font-medium text-sm sm:text-base">
                      {device.device}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm sm:text-base">
                      {formatNumber(device.count)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {device.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Models Table */}
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">
            Model Performance Details
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Detailed breakdown of your 3D models
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {(data?.topModels || []).map((model, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-base sm:text-lg">
                      {model.name}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {model.fileType}
                    </Badge>
                  </div>
                </div>
                <div className="text-right sm:text-left flex flex-wrap justify-end sm:justify-start gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatNumber(model.views)}
                    </p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium flex items-center gap-1">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatNumber(model.downloads)}
                    </p>
                    <p className="text-xs text-muted-foreground">downloads</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">
                      {((model.downloads / model.views) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">conversion</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">
            Recent Activity
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Latest interactions with your 3D models
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {(data?.recentActivity || []).map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    {activity.action === "View" ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Download className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {activity.action} - {activity.modelName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.userAgent} • {activity.country}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-1 sm:mt-0">
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
