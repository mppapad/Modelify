"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Check,
  Copy,
  FileText,
  Info,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

export default function DocumentationPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`import { Button } from "@/components/ui/button"

export function Component() {
  return <Button variant="outline">Click me</Button>
}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - For larger screens */}
          <div className="hidden lg:block col-span-1">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium mb-3">Components</h3>
                <ul className="space-y-2">
                  <li className="text-blue-600 dark:text-blue-400 font-medium">
                    → Button
                  </li>
                  <li className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Card
                  </li>
                  <li className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dialog
                  </li>
                  <li className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dropdown
                  </li>
                  <li className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Input
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="mr-2 h-6 w-6" />
                  Button
                </CardTitle>
                <CardDescription>
                  Interactive button component with various styles and states.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  A button component is used to trigger an action or event, such
                  as submitting a form, opening a dialog, canceling an action,
                  or performing a delete operation.
                </p>

                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Buttons should have meaningful labels that clearly indicate
                    their action.
                  </AlertDescription>
                </Alert>

                <Tabs defaultValue="preview" className="mb-6">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="preview"
                    className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md mt-2 flex gap-2"
                  >
                    <Button variant="default">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </TabsContent>
                  <TabsContent value="code" className="relative">
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-md mt-2 font-mono text-sm">
                      <pre>{`import { Button } from "@/components/ui/button"

export function DocsPage() {
  return <Button variant="outline">Click me</Button>
}`}</pre>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                <h3 className="text-xl font-semibold mb-3">Props</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-4 font-medium">
                          Prop
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Type
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Default
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-4 font-mono text-sm">variant</td>
                        <td className="py-2 px-4 font-mono text-sm">string</td>
                        <td className="py-2 px-4 font-mono text-sm">
                          "default"
                        </td>
                        <td className="py-2 px-4">Button style variant</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-4 font-mono text-sm">size</td>
                        <td className="py-2 px-4 font-mono text-sm">string</td>
                        <td className="py-2 px-4 font-mono text-sm">
                          "default"
                        </td>
                        <td className="py-2 px-4">Button size</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-mono text-sm">
                          disabled
                        </td>
                        <td className="py-2 px-4 font-mono text-sm">boolean</td>
                        <td className="py-2 px-4 font-mono text-sm">false</td>
                        <td className="py-2 px-4">Disables button</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button variant="outline" size="sm">
                  Previous: Installation
                </Button>
                <Button variant="outline" size="sm">
                  Next: Card
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                  <CardTitle>Usage Guidelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Accessibility Warning</AlertTitle>
                    <AlertDescription>
                      Ensure buttons have sufficient color contrast and include
                      appropriate aria attributes for screen readers.
                    </AlertDescription>
                  </Alert>

                  <h4 className="font-medium text-lg">Best Practices</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Use primary buttons for the main action</li>
                    <li>Use secondary buttons for alternative actions</li>
                    <li>Use clear, action-oriented button labels</li>
                    <li>Keep button text concise</li>
                    <li>
                      Maintain consistent button hierarchy across your
                      application
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
