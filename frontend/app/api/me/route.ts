import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendRes = await fetch(`${process.env.FASTAPI_URL}/auth/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: backendRes.status });
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}
