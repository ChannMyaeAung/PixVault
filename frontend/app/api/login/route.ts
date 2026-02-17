import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();

    const backendRes = await fetch("http://api:8000/auth/jwt/login", {
        method: "POST",
        body: formData,
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