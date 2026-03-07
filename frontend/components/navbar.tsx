"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "./ui/button";

const Navbar = ({ className }: { className?: string }) => {
  const [active, setActive] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const handleSignOut = async () => {
    await fetch("/api/logout", { method: "POST" });
    queryClient.removeQueries({ queryKey: ["me"] });
    queryClient.removeQueries({ queryKey: ["user"] });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav
      className={cn("fixed top-10 inset-x-5 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        {/* Mobile Menu */}
        <div className="flex sm:hidden items-center justify-center gap-10">
          <HoveredLink href="/">
            <div className="text-2xl font-black tracking-tighter">PixVault</div>
          </HoveredLink>
          <MenuItem setActive={setActive} active={active} item="Menu">
            <div className="flex flex-col space-y text-sm">
              <HoveredLink href="/upload">Upload</HoveredLink>
              <HoveredLink href="/dashboard">Dashboard</HoveredLink>

              {!isLoggedIn ? (
                <HoveredLink href="/login">Login</HoveredLink>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <Avatar>
                        <AvatarImage src={user?.url} />
                        <AvatarFallback>
                          {user?.email?.split("@")[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <BadgeCheckIcon />
                        <HoveredLink href="/profile">Account</HoveredLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCardIcon />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BellIcon />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleSignOut}
                    >
                      <LogOutIcon />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </MenuItem>
          <ModeToggle />
        </div>

        {/* Desktop Menu */}
        <div className="items-center gap-10 hidden sm:flex">
          <HoveredLink href="/">
            <div className="text-2xl font-black tracking-tighter">PixVault</div>
          </HoveredLink>
          <HoveredLink href="/upload">Upload</HoveredLink>
          <HoveredLink href="/dashboard">Dashboard</HoveredLink>

          {!isLoggedIn ? (
            <HoveredLink href="/login">Login</HoveredLink>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.url} />
                    <AvatarFallback>
                      {user?.email?.split("@")[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheckIcon />
                    <HoveredLink href="/profile">Account</HoveredLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BellIcon />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  <LogOutIcon />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ModeToggle />
        </div>
      </Menu>
    </nav>
  );
};

export default Navbar;
