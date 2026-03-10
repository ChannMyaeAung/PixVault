import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getErrorMessage(detail: unknown, fallback: string) {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String(item.msg);
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
}

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
    const errorData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: getErrorMessage(errorData.detail, "Failed to fetch user") },
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
    return NextResponse.json(
      {
        detail: getErrorMessage(
          errorData.detail ?? errorData.error,
          "Failed to update user",
        ),
      },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}
