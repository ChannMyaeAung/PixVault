import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Next.js App Router: increase body size limit for this route
export const maxDuration = 60; // seconds

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  // Rebuild FormData to ensure file name and content-type are preserved
  // (Next.js can lose file metadata when relaying FormData)
  const forwardData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      forwardData.append(key, value, value.name);
    } else {
      forwardData.append(key, value);
    }
  }

  const backendRes = await fetch(`${process.env.FASTAPI_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: forwardData,
  });

  const raw = await backendRes.text();
  let data: Record<string, unknown> = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { detail: raw || "Upload failed. Please try again." };
  }

  return NextResponse.json(data, { status: backendRes.status });
}
