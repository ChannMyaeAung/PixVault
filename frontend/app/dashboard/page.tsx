"use client";
import React from "react";
import { FeedResponse, PostType } from "./type";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PostCard from "@/components/post-card";
import { motion } from "motion/react";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconCloud } from "@tabler/icons-react";
import Link from "next/link";

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
      <div className="flex items-center justify-center min-h-screen px-6 py-20 md:py-32">
        <div className="max-w-md mx-auto">
          <Item variant={"muted"}>
            <ItemMedia>
              <Spinner />
            </ItemMedia>
            <ItemContent>Loading feed...</ItemContent>
          </Item>
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="min-h-screen px-6 py-20 md:py-32">
        <Card className="max-w-xl mx-auto border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">
              Unable to load feed
            </CardTitle>
            <CardDescription>
              Something went wrong while fetching your posts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );

  const postCount = data?.posts.length ?? 0;

  return (
    <div className="min-h-screen pt-36 pb-16 px-4 sm:px-6">
      <main className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">Your Feed</CardTitle>
              <CardDescription>
                Securely view, manage, and delete your uploaded media.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {postCount} {postCount === 1 ? "post" : "posts"}
              </span>
              <Button onClick={() => router.push("/upload")}>
                Upload New Media
              </Button>
            </div>
          </CardHeader>
        </Card>

        {postCount === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconCloud />
              </EmptyMedia>
              <EmptyTitle>Cloud Storage Empty</EmptyTitle>
              <EmptyDescription>
                Upload files to your cloud storage to access them anywhere.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/upload">
                <Button variant="outline" size="sm">
                  Upload Files
                </Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.posts.map((post: PostType, i: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
