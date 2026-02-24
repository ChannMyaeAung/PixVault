"use client";
import React, { useEffect, useState } from "react";
import { FeedResponse, PostType } from "./type";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery<FeedResponse>({
    queryKey: ["feed"],
    queryFn: async () => {
      const res = await fetch("/api/feed");
      if (res.status === 401) {
        router.push("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error("Failed to fetch feed");
      }
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading feed</div>;

  return (
    <div className="p-8 grid gap-6">
      {data?.posts.map((post: PostType) => (
        <div key={post.id} className="border p-4 rounded-xl">
          {post.file_type === "image" ? (
            <Image
              src={post.url}
              alt={post.caption || "Post image"}
              className="rounded-lg"
              width={500}
              height={500}
            />
          ) : (
            <video
              src={post.url}
              controls
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
