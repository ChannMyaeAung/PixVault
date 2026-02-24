import { NextResponse } from "next/server";

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

    const backendRes = await fetch(`${process.env.FASTAPI_URL}/auth/jwt/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    })

    const data = await backendRes.json();

    if (!backendRes.ok) {
        return NextResponse.json({ error: data.detail }, { status: backendRes.status });
    }

    // Store JWT in HTTP-only cookie 
    const response = NextResponse.json({ success: true });

    response.cookies.set("token", data.access_token, {
        httpOnly: true,
        path: "/",
    })

    return response;
}