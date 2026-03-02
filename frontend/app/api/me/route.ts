import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const backendRes = await fetch(`${process.env.FASTAPI_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: backendRes.status },
    );
  }
  return NextResponse.json(await backendRes.json(), {
    status: backendRes.status,
  });
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const body = await req.json();

  const backendRes = await fetch(`${process.env.FASTAPI_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!backendRes.ok) {
    const errorData = await backendRes.json();
    return NextResponse.json(errorData, { status: backendRes.status });
  }
  return NextResponse.json(await backendRes.json(), {
    status: backendRes.status,
  });
}
