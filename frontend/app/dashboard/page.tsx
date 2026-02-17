"use client";
import React, { useEffect, useState } from 'react'
import { FeedResponse, PostType } from './type';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {

    const { data, isLoading, isError } = useQuery<FeedResponse>({
        queryKey: ["feed"],
        queryFn: async () => {
            const res = await fetch("/api/feed");
            if (!res.ok) {
                throw new Error("Failed to fetch feed");
            }
            return res.json();
        }
    })

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading feed</div>


  return (
      <div>
          {data?.posts.map((post: PostType) => (
              <div key={post.id}>
                  {post.caption}
              </div>
          ))}
    </div>
  )
}

export default Dashboard