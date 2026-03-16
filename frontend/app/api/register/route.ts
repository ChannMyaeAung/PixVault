import { NextResponse } from "next/server";

export async function POST(req: Request) {
    if (!process.env.FASTAPI_URL) {
        return NextResponse.json(
            { detail: "FASTAPI_URL is not configured." },
            { status: 500 }
        );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json(
            { detail: "Invalid request body." },
            { status: 400 }
        );
    }

    try {
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
    } catch {
        return NextResponse.json(
            { detail: "Unable to reach backend service." },
            { status: 502 }
        );
    }
}