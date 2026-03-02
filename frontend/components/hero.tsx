"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { LockIcon, Smartphone, Zap } from "lucide-react";
import FeatureCard from "./feature-card";

const HeroPage = () => {
  const { data: user, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    retry: false, // Don't retry on failure, we just want to know if the user is logged in or not, this is to avoid repeated failed requests when logged out.
  });

  const isLoggedIn = !isError && !!user;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight ">
        Your Secure <span className="text-blue-600">Media Vault</span>
      </h1>

      <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        Store, manage, and protect your personal phots and videos with ease.
        Built with lightning-fast web technologies to ensure your privacy statys
        strictly yours.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {isLoggedIn ? (
          <Button size={"lg"} asChild className="text-base px-8 h-12">
            <Link href={"/dashboard"}>Open Your Vault</Link>
          </Button>
        ) : (
          <>
            <Button
              size={"lg"}
              asChild
              className="text-base px-8 h-12 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/register">Get Started for Free</Link>
            </Button>
            <Button
              size={"lg"}
              variant={"outline"}
              asChild
              className="text-base px-8 h-12 bg-white"
            >
              <Link href="/login">Log In to Account</Link>
            </Button>
          </>
        )}
      </div>

      {/* Feature Grid*/}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
        <FeatureCard
          icon={<LockIcon />}
          title="Secure by Design"
          description="Your media is kept completely private. Only you hold the keys to view your memories."
        />
        <FeatureCard
          icon={<Zap />}
          title="Lightning Fast"
          description="Powered by a high-performance backend so your uploads and galleries load instantly."
        />
        <FeatureCard
          icon={<Smartphone />}
          title="Access Anywhere"
          description="Responsive design ensures your vault looks perfect on your phone, tablet, or desktop."
        />
      </div>
    </div>
  );
};

export default HeroPage;
