"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";
import { downscaleImageIfNeeded } from "@/lib/image-utils";

type UploadAuthResponse = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  uploadUrl: string;
};

export default function UploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  // FIX: Accept an array of files, then extract the first one
  const handleFileUpload = (files: File[]) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    setFile(selectedFile);
    // You can safely uncomment this now if you need the preview
    // setPreview(URL.createObjectURL(selectedFile));
  };

  const uploadPost = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a file to upload");

      const uploadFile = await downscaleImageIfNeeded(file);

      // 1) Fetch signed auth params from backend (small request)
      const authRes = await fetch("/api/upload/auth", {
        method: "POST",
      });
      if (!authRes.ok) {
        const data = await authRes.json().catch(() => ({}));
        throw new Error((data.detail as string) || "Failed to authorize upload.");
      }
      const authData = (await authRes.json()) as UploadAuthResponse;

      // 2) Upload file directly to ImageKit (bypasses Vercel body limits)
      const imageKitFormData = new FormData();
      imageKitFormData.append("file", uploadFile);
      imageKitFormData.append("fileName", uploadFile.name);
      imageKitFormData.append("publicKey", authData.publicKey);
      imageKitFormData.append("token", authData.token);
      imageKitFormData.append("expire", String(authData.expire));
      imageKitFormData.append("signature", authData.signature);
      imageKitFormData.append("useUniqueFileName", "true");

      const uploadRes = await fetch(authData.uploadUrl, {
        method: "POST",
        body: imageKitFormData,
      });

      const uploadRaw = await uploadRes.text();
      let uploadData: Record<string, unknown> = {};
      try {
        uploadData = uploadRaw ? JSON.parse(uploadRaw) : {};
      } catch {
        uploadData = { message: uploadRaw || "Upload failed." };
      }

      if (!uploadRes.ok || typeof uploadData.url !== "string") {
        throw new Error(
          (uploadData.message as string) ||
            (uploadData.error as string) ||
            "Upload failed. Please try again.",
        );
      }

      // 3) Persist metadata to backend DB
      const saveRes = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption,
          url: uploadData.url,
          file_name:
            (uploadData.name as string) ||
            (uploadData.fileName as string) ||
            uploadFile.name,
          file_type: uploadFile.type.startsWith("video/") ? "video" : "image",
        }),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        throw new Error((data.detail as string) || "Failed to save post metadata.");
      }

      return saveRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    uploadPost.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span aria-hidden="true">&larr;</span> Back to Vault
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight ">Upload Media</h1>
          <p className=" mt-2 text-sm text-slate-500">
            Add a new photo or video to your secure vault.
          </p>
        </div>

        {/* Upload Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6 sm:p-8 rounded-2xl border bg-white dark:bg-black shadow-sm"
        >
          {/* Drag & Drop Zone / Preview */}
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
          </div>

          {/* Caption Input */}
          <div className="space-y-4">
            <label htmlFor="caption" className="text-sm font-medium">
              Caption (Optional)
            </label>
            <Input
              id="caption"
              type="text"
              placeholder="Write a brief description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {/* Error Message */}
          {uploadPost.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium text-center">
              {(uploadPost.error as Error).message}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 text-base shadow-sm"
            disabled={!file || uploadPost.isPending}
          >
            {uploadPost.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading securely...
              </span>
            ) : (
              "Upload to Vault"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
