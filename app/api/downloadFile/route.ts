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

  const arrayBuffer = await res.arrayBuffer();
  // extraemos extensión limpia
  const nameWithQuery = fileUrl.split("/").pop() || "archivo";
  const [fileName] = nameWithQuery.split("?");
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  // determinamos Content-Type
  let contentType = "application/octet-stream";
  if (ext === "pdf") contentType = "application/pdf";
  else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
  else if (ext === "png") contentType = "image/png";

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${fileName}"`,
  });

  return new NextResponse(Buffer.from(arrayBuffer), { headers });
}