"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

const LoginPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store the warmup promise so login can await it before submitting,
  // ensuring the Heroku dyno is fully awake on the first attempt.
  const warmupRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    warmupRef.current = fetch("/api/warmup").then(() => {}).catch(() => {});
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await warmupRef.current;
      const res = await fetch("/api/login", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.detail || "Login failed.",
        );
      }
      return res.json();
    },
    // Invalidate the "me" and "user" queries to update the app state so that when the user logged in, they will see the Avatar instead of Login button in the Navbar
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Logged in successfully.");
      router.refresh();
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed.");
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    loginMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login to PixVault
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Login"
              )}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loginMutation.isPending}
              onClick={() => {
                const formData = new FormData();
                formData.append("email", "user@example.com");
                formData.append("password", "12345678");
                loginMutation.mutate(formData);
              }}
            >
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Use Demo Account"
              )}
            </Button>
          </form>

          <p className="text-sm text-center mt-4 text-muted-foreground">
            Don’t have an account?{" "}
            <a href="/register" className="underline">
              Register
            </a>
          </p>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
