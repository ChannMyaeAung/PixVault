"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import FeaturesCard from "./features-card";
import { motion } from "motion/react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const, delay },
});

const HeroPage = () => {
  const { data: user, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    retry: false,
  });

  const isLoggedIn = !isError && !!user;

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <motion.h1
        {...fadeUp(0)}
        className="text-5xl flex flex-col md:flex-row items-center justify-center md:text-7xl font-extrabold tracking-tight gap-3"
      >
        Your Secure <span className="text-blue-600"> Media Vault</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.1)}
        className="text-lg md:text-xl text-center max-w-2xl mx-auto leading-relaxed"
      >
        Store, manage, and protect your personal photos and videos with ease.
        Built with lightning-fast web technologies to ensure your privacy stays
        strictly yours.
      </motion.p>

      <motion.div
        {...fadeUp(0.2)}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
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
      </motion.div>

      <motion.div {...fadeUp(0.3)}>
        <FeaturesCard />
      </motion.div>
    </div>
  );
};

export default HeroPage;
