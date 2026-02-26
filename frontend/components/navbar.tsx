"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PostType } from "@/app/dashboard/type";
import { ModeToggle } from "./mode-toggle";
import { useQuery } from "@tanstack/react-query";

const Navbar = ({ className }: { className?: string }) => {
  const [active, setActive] = useState<string | null>(null);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user</div>;

  return (
    <nav
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Services">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/upload">Upload</HoveredLink>
            <HoveredLink href="/dashboard">Dashboard</HoveredLink>
            <HoveredLink>
              <Avatar>
                <AvatarImage src={user?.url} />
                <AvatarFallback>{user?.email?.split("@")[0]}</AvatarFallback>
              </Avatar>
            </HoveredLink>
          </div>
        </MenuItem>
        <ModeToggle />
      </Menu>
    </nav>
  );
};

export default Navbar;
