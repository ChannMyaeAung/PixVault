import { NextResponse } from "next/server";

function getLoginErrorMessage(detail: unknown) {
  if (typeof detail === "string") {
    if (detail === "LOGIN_BAD_CREDENTIALS") {
      return "Incorrect email or password.";
    }
    return detail;
  }

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

  return "Login failed.";
}

export async function POST(req: Request) {
  const formData = await req.formData();

  // Convert FormData to URLSearchParams (application/x-www-form-urlencoded)
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    // Map 'email' field to 'username' for FastAPI Users compatibility
    if (key === "email") {
      params.append("username", value as string);
    } else {
      params.append(key, value as string);
    }
  });

  let backendRes: Response;
  try {
    backendRes = await fetch(`${process.env.FASTAPI_URL}/auth/jwt/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the server. Please try again in a moment." },
      { status: 503 },
    );
  }

  const raw = await backendRes.text();
  let data: Record<string, unknown> = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { error: raw || "Login failed." };
  }

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: getLoginErrorMessage(data.detail) },
      { status: backendRes.status },
    );
  }

  // Only set the cookie if it's a real string token because response.cookies.set() will throw if value is not a string
  const accessToken =
    typeof data.access_token === "string" ? data.access_token : null;

  // return a 502 fallback if the backend resposne is malformed
  if (!accessToken) {
    return NextResponse.json({ error: "Login failed." }, { status: 502 });
  }

  // Store JWT in HTTP-only cookie
  const response = NextResponse.json({ success: true });

  response.cookies.set("token", accessToken, {
    httpOnly: true,
    path: "/",
  });

  return response;
}
