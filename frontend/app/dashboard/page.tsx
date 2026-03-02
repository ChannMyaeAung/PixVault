"use client";
import React from "react";
import { FeedResponse, PostType } from "./type";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PostCard from "@/components/post-card";
import Navbar from "@/components/navbar";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<FeedResponse>({
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

  if (isLoading)
    return (
      <div className="flex w-full max-w-md mx-auto p-4 flex-col gap-4 [--radius:1rem]">
        <Item variant={"muted"}>
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>Loading feed...</ItemContent>
        </Item>
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-red-500 text-center font-medium">
        Unable to load your feed at this time.
      </div>
    );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Page Header */}
        <div>
          <div>
            <h1>Your Feed</h1>
            <p>Securely view and manage your uploaded media.</p>
            <Button></Button>
          </div>
        </div>
      </main>
      {data?.posts.map((post: PostType) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Dashboard;
