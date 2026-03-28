"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user/me");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch user");
      }
      return res.json();
    },
  });

  const currentEmail = emailTouched ? email : (user?.email ?? "");

  const updateMutation = useMutation({
    mutationFn: async (updateData: { email?: string; password?: string }) => {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData.detail as string) || "Failed to update profile",
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setPassword(""); // Clear the password field for security
      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    },
    onError: (error) =>
      toast.error(error.message || "An error occurred updating the profile."),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Only send the password payload if the user actually typed a new one
    const updatePayload: { email?: string; password?: string } = {
      email: currentEmail,
    };
    if (password) updatePayload.password = password;

    updateMutation.mutate(updatePayload);
  };

  if (isLoading)
    return (
      <div className="flex w-full min-h-screen max-w-md items-center justify-center mx-auto p-4 flex-col gap-4 [--radius:1rem]">
        <Item variant={"muted"}>
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>Loading feed...</ItemContent>
        </Item>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-md mx-auto px-8 flex items-center flex-col justify-center min-h-screen space-y-6"
    >
      <h1 className="text-2xl font-bold self-start">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4 self-start">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input
            type="email"
            value={currentEmail}
            onChange={(e) => {
              setEmailTouched(true);
              setEmail(e.target.value);
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </motion.div>
  );
}
