import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Inicializa Admin SDK una sola vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "contrataciones-pissa.appspot.com",
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");  // ahora recibimos “path” en lugar de URL completa

  if (!path) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }

  // Descarga el buffer y la metadata
  const bucket = admin.storage().bucket();
  const file = bucket.file(decodeURIComponent(path));
  const [buffer] = await file.download();
  const [meta] = await file.getMetadata();

  const fileName = meta.metadata?.originalName || meta.name.split("/").pop();
  const contentType = meta.contentType || "application/octet-stream";

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${fileName}"`,
  });

  return new NextResponse(buffer, { headers });
}