/**
 * downloadFile/route.ts
 *
 * Proporciona funcionalidad para descargar archivos desde URLs externas.
 *
 * Este módulo implementa un endpoint API que actúa como proxy para descargar
 * archivos desde URLs proporcionadas, estableciendo los headers apropiados
 * para forzar la descarga del archivo.
 */

import { NextResponse } from "next/server";

/**
 * Maneja las peticiones GET para descargar archivos desde URLs externas.
 *
 * Esta función actúa como un proxy que fetch un archivo desde una URL externa
 * y lo retorna con los headers apropiados para forzar la descarga. Determina
 * automáticamente el tipo de contenido basado en la extensión del archivo.
 *
 * @param request - El objeto Request que contiene la URL del archivo a descargar
 * @returns Una respuesta NextResponse con el archivo descargado y headers apropiados
 * @throws Retorna error 400 si no se proporciona la URL
 * @throws Retorna error con el código de estado correspondiente si falla la descarga
 *
 * @example
 * ```ts
 * GET /api/downloadFile?url=https://ejemplo.com/documento.pdf
 * // Descarga el archivo PDF y lo retorna con headers de descarga
 * ```
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  // Validación de parámetros requeridos
  if (!fileUrl) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  // Intenta descargar el archivo desde la URL proporcionada
  const res = await fetch(fileUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "fetch failed" }, { status: res.status });
  }

  const arrayBuffer = await res.arrayBuffer();

  // Extrae el nombre del archivo y la extensión de la URL
  const nameWithQuery = fileUrl.split("/").pop() || "archivo";
  const [fileName] = nameWithQuery.split("?");
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // Determina el Content-Type basado en la extensión del archivo
  let contentType = "application/octet-stream";
  if (ext === "pdf") contentType = "application/pdf";
  else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
  else if (ext === "png") contentType = "image/png";

  // Configura los headers para forzar la descarga del archivo
  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${fileName}"`,
  });

  return new NextResponse(Buffer.from(arrayBuffer), { headers });
}
