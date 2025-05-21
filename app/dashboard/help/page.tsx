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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Copy,
  Check,
  HelpCircle,
  FileQuestion,
  HeartHandshake,
} from "lucide-react";

// Import the skeleton component
const GetHelpPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-48 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-72 mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contact Form Card Skeleton */}
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-48 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-64 mt-2 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-16 animate-pulse"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-16 animate-pulse"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24 animate-pulse"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-20 animate-pulse"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
              </div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Support Admin Card Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-48 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-40 mt-2 animate-pulse"></div>
            </div>
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-full mr-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-36 animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Card Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="mb-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-48 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="py-3 border-b border-slate-200 dark:border-slate-700"
              >
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-full max-w-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GetHelpPage() {
  useEffect(() => {
    document.title = "Modelify | Get Help";
  }, []);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Change header

  // Simulate loading state
  useEffect(() => {
    // Simulate data loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("miltospap5@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    // Set sending state
    setIsSending(true);

    // In a real application, this would use a backend API or email service
    // For this example, we'll simulate email sending to miltospap5@gmail.com

    // Create a mailto link programmatically
    const mailtoLink = `mailto:miltospap5@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;

    // Open the default email client
    window.location.href = mailtoLink;

    // Simulate email sending completion
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);

      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");

      // Reset success message after a delay
      setTimeout(() => setIsSuccess(false), 5000);
    }, 500);
  };

  // Show skeleton while loading
  if (loading) {
    return <GetHelpPageSkeleton />;
  }

  // Show actual content once loaded
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Get Help</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Have questions or need assistance? Our support team is here to help
            you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Fill out the form below to send an email directly to
                miltospap5@gmail.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in detail"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full sm:w-auto"
                onClick={handleSubmit}
                disabled={isSending || !name || !email || !message}
              >
                {isSending ? "Sending..." : "Send Email to Administrator"}
              </Button>
              {isSuccess && (
                <div className="text-green-600 dark:text-green-400 flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Email client opened with
                  your message
                </div>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support Administrator
              </CardTitle>
              <CardDescription>
                Contact our administrator directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                    MP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Miltiadis Papadopoulos</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Administrator
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Available
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Contact Information</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="flex-grow truncate">
                    miltospap5@gmail.com
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleCopyEmail}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Response time: ~24 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                <AccordionContent>
                  No need! Modelify is completely password less!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  How can I update my account information?
                </AccordionTrigger>
                <AccordionContent>
                  You can update your account information by navigating to the
                  Account Settings page after logging in. From there, you can
                  edit your profile details.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  What should I do if I encounter an error?
                </AccordionTrigger>
                <AccordionContent>
                  If you encounter an error, please try refreshing the page
                  first. If the problem persists, please contact our support
                  team with details about the error and the steps to reproduce
                  it.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How can I export my data?</AccordionTrigger>
                <AccordionContent>
                  You can export your data by going to the Analytics Dashboard,
                  selecting the date range for the data you want to export, and
                  clicking on the "Export" button.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>
          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Knowledge Base</CardTitle>
                <CardDescription>
                  Browse our extensive knowledge base for tutorials and guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start text-left flex flex-col items-start"
                  >
                    <span className="font-medium">Getting Started Guide</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Learn the basics of our platform
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start text-left flex flex-col items-start"
                  >
                    <span className="font-medium">Analytics Tutorial</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      How to use the analytics dashboard
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start text-left flex flex-col items-start"
                  >
                    <span className="font-medium">API Documentation</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Integrate with our API
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start text-left flex flex-col items-start"
                  >
                    <span className="font-medium">Troubleshooting</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Common issues and solutions
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
