import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const formData = await req.formData();

    const backendRes = await fetch("http://api:8000/upload", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData,
    })

    const data = await backendRes.json();

    return NextResponse.json(data, {status: backendRes.status})
}