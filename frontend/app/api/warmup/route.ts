import { NextResponse } from "next/server";

export async function GET() {
  const maxAttempts = 4;
  const attemptTimeout = 10000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${process.env.FASTAPI_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(attemptTimeout),
      });
      if (res.ok) {
        return NextResponse.json({ ok: true });
      }
    } catch {
      // Backend not ready yet — retry
    }
  }

  // All attempts failed — signal the client so it can warn the user
  return NextResponse.json({ ok: false }, { status: 503 });
}
