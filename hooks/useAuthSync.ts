import { useEffect, useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { createAppwriteUserId } from "@/lib/appwrite";

export const useAuthSync = () => {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const syncUserToAppwrite = async () => {
      if (!isAuthenticated || !user || isLoading) return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        // Call server-side API to sync user
        const response = await fetch("/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to sync user");
        }

        const data = await response.json();
        console.log("User synced successfully:", data);
      } catch (error: any) {
        console.error("Error syncing user to Appwrite:", error);
        setSyncError(error.message);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserToAppwrite();
  }, [isAuthenticated, user, isLoading]);

  return {
    isSyncing,
    syncError,
    appwriteUserId: user ? createAppwriteUserId(user.id) : null,
  };
};
