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
  const [isDemoLogin, setIsDemoLogin] = useState(false);

  // Store the warmup promise so login can await it before submitting,
  // ensuring the Heroku dyno is fully awake on the first attempt.
  const warmupRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    warmupRef.current = fetch("/api/warmup").then(() => {}).catch(() => {});
  }, []);

  const attemptLogin = async (formData: FormData) => {
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
  };

  const loginMutation = useMutation({
    mutationFn: async ({
      formData,
      retries = 0,
    }: {
      formData: FormData;
      retries?: number;
    }) => {
      await warmupRef.current;

      let lastError = new Error("Login failed.");
      const maxAttempts = retries + 1;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return await attemptLogin(formData);
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error("Login failed.");

          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            warmupRef.current = fetch("/api/warmup")
              .then(() => {})
              .catch(() => {});
            await warmupRef.current;
          }
        }
      }

      throw lastError;
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
    loginMutation.mutate({ formData });
  };

  const handleDemoLogin = () => {
    const formData = new FormData();
    formData.append("email", "user@example.com");
    formData.append("password", "12345678");
    setIsDemoLogin(true);
    loginMutation.mutate(
      { formData, retries: 1 },
      { onSettled: () => setIsDemoLogin(false) },
    );
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
              onClick={handleDemoLogin}
            >
              {loginMutation.isPending && isDemoLogin ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Logging in...
                </>
              ) : loginMutation.isPending ? (
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
