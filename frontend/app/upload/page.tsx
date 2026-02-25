"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const uploadPost = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Please select a file");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Upload failed");
      }

      return res.json();
    },

    onSuccess: () => {
      // Refresh feed after successful upload
      queryClient.invalidateQueries({ queryKey: ["feed"] });

      // Redirect back to dashboard
      router.push("/dashboard");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    uploadPost.mutate();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Upload New Post
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />

            <Input
              type="text"
              placeholder="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            {uploadPost.isError && (
              <p className="text-sm text-red-500 text-center">
                {(uploadPost.error as Error).message}
              </p>
            )}

            <Button className="w-full" disabled={uploadPost.isPending}>
              {uploadPost.isPending ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
