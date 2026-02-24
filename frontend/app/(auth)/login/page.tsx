"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/login", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      router.push("/dashboard");
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
      <Card className="w-full max-w-md">
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

            {loginMutation.isError && (
              <p className="text-sm text-red-500 text-center">
                {(loginMutation.error as Error).message}
              </p>
            )}

            <Button className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Login"
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
    </div>
  );
};

export default LoginPage;
