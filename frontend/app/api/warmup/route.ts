import { NextResponse } from "next/server";

export async function GET() {
  try {
    await fetch(`${process.env.FASTAPI_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    // Silently ignore — the goal is just to wake the dyno
  }
  return NextResponse.json({ ok: true });
}
