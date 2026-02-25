"use client";
import { FeedResponse, PostType } from "@/app/dashboard/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
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
      return res.json();
    },

    onSuccess: () => {
      // Refetch feed automatically by making cached query data as stale
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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

  return (
    <div className="border rounded-xl p-4 space-y-3 shadow-sm">
      <div className="max-w-md max-h-md relative aspect-square">
        {post.file_type === "image" ? (
          <Image
            src={post.url}
            alt={post.caption}
            fill
            className="rounded-lg absolute w-full"
          />
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
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </Button>
      )}
    </div>
  );
};

export default PostCard;
