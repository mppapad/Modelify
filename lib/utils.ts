import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const createAppwriteUserId = (kindeUserId: string): string => {
  // Remove any special characters and ensure it starts with alphanumeric
  const cleanId = kindeUserId.replace(/[^a-zA-Z0-9._-]/g, "");

  // If it starts with a special char, prefix with 'u'
  const safeId = /^[a-zA-Z0-9]/.test(cleanId) ? cleanId : `u${cleanId}`;

  // Truncate to 36 chars max
  return safeId.substring(0, 36);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
