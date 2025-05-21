"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Define the form schema
const accountFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(50, { message: "Name must not be longer than 50 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

type User = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
};

export function AccountForm({ user }: { user: User }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }

    return initials;
  };

  // Setup form with default values
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  // Submit handler
  async function onSubmit(data: AccountFormValues) {
    setIsLoading(true);

    try {
      // NOTE: You will need to implement this API route
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      toast("Profile updated", {
        description: "Your profile information has been updated.",
      });

      router.refresh();
    } catch (error) {
      toast("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle profile picture upload
  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast("File too large", {
        description: "Image must be less than 2MB.",
      });
      return;
    }

    // File type validation
    if (!file.type.startsWith("image/")) {
      toast("Invalid file type", {
        description: "Please upload an image file.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", user.id);

      // NOTE: You will need to implement this API route
      const response = await fetch("/api/user/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      toast("Profile picture updated", {
        description: "Your profile picture has been updated.",
      });

      router.refresh();
    } catch (error) {
      toast("Error", {
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Profile Picture</h3>
        <div className="mt-4 flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <Input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                className="relative"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload new image"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. 2MB max.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>
                  Your email is managed by your authentication provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
