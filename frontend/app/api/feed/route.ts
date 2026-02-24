import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value; 

    const backendRes = await fetch(`${process.env.FASTAPI_URL}/feed`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })

    const data = await backendRes.json();

    return NextResponse.json(data, {status: backendRes.status})
}