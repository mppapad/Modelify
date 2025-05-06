"use client";

import { useState, useEffect } from "react";
import { AccountForm } from "@/components/account/account-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserData } from "@/types/user-data";

type AccountPageClientProps = {
  userData: UserData;
};

export function AccountPageClient({ userData }: AccountPageClientProps) {
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const BlurredShapes = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-1/4 -left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2s"></div>
      <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4s"></div>
    </div>
  );

  const AccountSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <BlurredShapes />
      <div className="grid gap-6">
        {loading ? (
          <AccountSkeleton />
        ) : (
          <>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountForm user={userData} />
              </CardContent>
            </Card>

            <Card className="border-destructive/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanent actions that can't be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/30 mb-4">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-400">
                    Important
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    Account deletion is permanent and cannot be undone. All your
                    data will be permanently removed.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full sm:w-auto"
                >
                  Request Account Deletion
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Account Deletion</DialogTitle>
            <DialogDescription>
              To delete your account, please contact our admin team directly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Send an email to{" "}
              <span className="font-medium">miltospap5@gmail.com</span> with the
              following information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Your full name</li>
              <li>
                Email address:{" "}
                <span className="font-medium">{userData?.email}</span>
              </li>
              <li>
                Account ID: <span className="font-medium">{userData?.id}</span>
              </li>
              <li>Reason for account deletion (optional)</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Our team will process your request within 5 business days.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                window.location.href = `mailto:miltospap5@gmail.com?subject=Account Deletion Request&body=Hello,%0D%0A%0D%0AI would like to request deletion of my account with the following details:%0D%0A%0D%0AFull Name: ${userData?.given_name} ${userData?.family_name}%0D%0AEmail: ${userData?.email}%0D%0AAccount ID: ${userData?.id}%0D%0A%0D%0AThank you.`;
              }}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Compose Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
