"use client";
import React, { useEffect, useState } from "react";
import { FeedResponse, PostType } from "./type";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PostCard from "@/components/post-card";
import Navbar from "@/components/navbar";

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
      return await res.json();
    },
  });

  if (isLoading) return <div className="p-8">Loading feed...</div>;
  if (isError)
    return <div className="p-8 text-red-500">Error loading feed</div>;

  return (
    <div className="p-8 grid gap-6">
      {data?.posts.map((post: PostType) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Dashboard;
