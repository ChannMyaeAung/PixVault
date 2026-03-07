import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${process.env.FASTAPI_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const body = await req.json().catch(() => null);

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!body) {
    return NextResponse.json(
      { detail: "Invalid request body" },
      { status: 400 },
    );
  }

  const res = await fetch(`${process.env.FASTAPI_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Failed to update user" }));
    return NextResponse.json(errorData, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
