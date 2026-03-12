import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();

    const backendRes = await fetch(`${process.env.FASTAPI_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    })

    const raw = await backendRes.text();
    let data: Record<string, unknown> = {};

    try {
        data = raw ? JSON.parse(raw) : {};
    } catch {
        data = { detail: raw || "Registration failed." };
    }

    return NextResponse.json(data, {status: backendRes.status})
}