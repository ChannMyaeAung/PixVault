"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Clean up object URLs to prevent memory leaks when preview changes or unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelection = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const uploadPost = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a file to upload");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed. Please try again.");
      }
      return res.json();
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

  // Drag and drop event handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <span aria-hidden="true">&larr;</span> Back to Vault
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Upload Media
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Add a new photo or video to your secure vault.
          </p>
        </div>

        {/* Upload Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm"
        >
          {/* Drag & Drop Zone / Preview */}
          <div
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {preview ? (
              // Media Preview State
              <div className="relative w-full h-full group">
                {file?.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium drop-shadow-md">
                    Click to change media
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileSelection(e.target.files?.[0])}
                />
              </div>
            ) : (
              // Empty Upload State
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                <div className="w-12 h-12 mb-3 text-slate-400 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <p className="mb-2 text-sm text-slate-600 font-medium">
                  <span className="text-blue-600">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-slate-500">PNG, JPG, MP4 or WEBM</p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileSelection(e.target.files?.[0])}
                />
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <label
              htmlFor="caption"
              className="text-sm font-medium text-slate-900"
            >
              Caption (Optional)
            </label>
            <Input
              id="caption"
              type="text"
              placeholder="Write a brief description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-slate-50"
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
              <span className="flex items-center gap-2">
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
