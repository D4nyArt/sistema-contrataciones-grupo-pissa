import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  if (!fileUrl) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }


  const res = await fetch(fileUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "fetch failed" }, { status: res.status });
  }

  const blob = await res.arrayBuffer();
  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${fileUrl.split("/").pop()}"`,
  });

  return new NextResponse(Buffer.from(blob), { headers });
}