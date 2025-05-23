import { storage, BUCKET_ID } from "@/lib/appwrite-server";

export const getFileUrl = (fileId: string): string => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
};

export const getFileDownloadUrl = (fileId: string): string => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
};

// Helper to organize files by user in storage
export const createUserFolderStructure = (
  userId: string,
  fileName: string
): string => {
  // Create a path-like structure: users/userId/fileName
  return `users/${userId}/${fileName}`;
};

// Helper to format file sizes
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
