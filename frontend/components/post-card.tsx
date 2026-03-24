"use client";
import { FeedResponse, PostType } from "@/app/dashboard/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";

const PostCard = ({ post }: { post: PostType }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      // Safely handle 204 status to prevent JSON parsing crashes
      if (res.status === 204) {
        return null;
      }

      return res.json();
    },

    // Runs immediately when mutate() is called
    // Remove the post from UI Before the server confirms deletion (Optimistic Update)
    onMutate: async (id: string) => {
      // 1. stop any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      // 2. Get current feed data
      const previous = queryClient.getQueryData(["feed"]);

      // 3. Remove this post from cached feed
      if (previous) {
        queryClient.setQueryData<FeedResponse>(["feed"], {
          posts: (previous as FeedResponse).posts.filter((p) => p.id !== id),
        });
      }

      // 4. Return previous data for rollback
      return { previous };
    },

    // If error occurs, restore old feed
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["feed"], context.previous);
      }
    },

    // After success or error, refetch the feed to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const [imgError, setImgError] = useState(false);

  return (
    <div className="border rounded-xl p-4 space-y-3 shadow-sm">
      <div className="max-w-md max-h-md relative aspect-square">
        {post.file_type === "image" ? (
          imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-lg text-muted-foreground text-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <p>Image unavailable</p>
              <p className="text-xs">This image exceeds the host size limit.<br/>Delete and re-upload to fix.</p>
            </div>
          ) : (
            <Image
              src={post.url}
              alt={post.caption}
              fill
              unoptimized
              className="rounded-lg absolute w-full object-cover"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <video
            src={post.url}
            controls
            className="rounded-lg w-full aspect-video"
          />
        )}
      </div>

      <p className="font-medium">{post.caption}</p>

      <div className="text-sm text-muted-foreground">
        {post.email} - {new Date(post.created_at).toLocaleString()}
      </div>

      {post.is_owner && (
        <Button
          onClick={() => deleteMutation.mutate(post.id)}
          disabled={deleteMutation.isPending}
          variant={"destructive"}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </Button>
      )}
    </div>
  );
};

export default PostCard;
