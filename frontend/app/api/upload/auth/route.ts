import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const backendRes = await fetch(`${process.env.FASTAPI_URL}/upload/auth`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await backendRes.text();
  let data: Record<string, unknown> = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { detail: raw || "Failed to get upload auth." };
  }

  return NextResponse.json(data, { status: backendRes.status });
}