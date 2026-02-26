import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const backendRes = await fetch(
    `${process.env.FASTAPI_URL}/posts/${params.id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  // If FastAPI returns 204 No Content, return an empty response immediately
  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await backendRes.json();

  return NextResponse.json(data, { status: backendRes.status });
}
