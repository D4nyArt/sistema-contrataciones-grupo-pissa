/**
 * getCurrentUserID/route.ts
 *
 * Proporciona funcionalidad para obtener únicamente el ID del usuario autenticado.
 *
 * Este módulo implementa un endpoint API ligero que retorna solo el identificador
 * del usuario que está actualmente autenticado en la sesión, sin realizar consultas
 * adicionales a la base de datos. Útil para operaciones que solo requieren el ID
 * del usuario sin necesidad de cargar todos sus datos.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Maneja las peticiones GET para obtener el ID del usuario autenticado.
 *
 * Extrae y retorna únicamente el identificador del usuario que está actualmente
 * en sesión, obtenido desde la cookie "candidateId". Este endpoint es más eficiente
 * que getCurrentUser cuando solo se necesita el ID del usuario sin sus datos completos.
 *
 * Características:
 * - No realiza consultas a la base de datos
 * - Retorna la cookie completa con valor y metadatos
 * - Operación de alta velocidad y bajo consumo de recursos
 * - Ideal para validaciones rápidas de autenticación
 *
 * @returns Una respuesta NextResponse con el objeto cookie del usuario autenticado
 * @throws Retorna null si la cookie "candidateId" no existe o está vacía
 *
 * @example
 * ```ts
 * // GET /api/getCurrentUserID
 * // Retorna (si el usuario está autenticado):
 * // {
 * //   "name": "candidateId",
 * //   "value": "abc123xyz789",
 * //   "path": "/",
 * //   "httpOnly": true,
 * //   "secure": true
 * // }
 *
 * // Retorna (si no hay usuario autenticado):
 * // null
 * ```
 *
 * @see {@link getCurrentUser} Para obtener datos completos del usuario
 */
export async function GET() {
  // Obtiene el almacén de cookies de la sesión actual
  const cookieStore = await cookies();

  // Extrae la cookie que contiene el ID del usuario autenticado
  const userId = cookieStore.get("candidateId");

  // Retorna el objeto cookie completo (incluyendo metadatos)
  return NextResponse.json(userId);
}
