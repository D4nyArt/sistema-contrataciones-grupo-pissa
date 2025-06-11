/**
 * saveUIDCookie/route.ts
 *
 * Proporciona funcionalidad para guardar el UID del usuario en una cookie de sesión.
 *
 * Este módulo implementa un endpoint API que permite establecer una cookie segura
 * con el identificador del usuario autenticado. La cookie se utiliza para mantener
 * la sesión del usuario a través de las diferentes páginas de la aplicación,
 * proporcionando un mecanismo de autenticación persistente y seguro.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Maneja las peticiones POST para guardar el UID del usuario en una cookie.
 *
 * Establece una cookie segura llamada "candidateId" con el UID proporcionado,
 * configurada con parámetros de seguridad apropiados para mantener la sesión
 * del usuario. La cookie expira después de 24 horas y está configurada con
 * restricciones de seguridad para prevenir ataques XSS y CSRF.
 *
 * Características de seguridad:
 * - httpOnly: Previene acceso desde JavaScript del lado cliente
 * - secure: Requiere HTTPS en producción
 * - sameSite: "strict" para prevenir ataques CSRF
 * - maxAge: Expiración automática después de 24 horas
 * - path: Disponible en toda la aplicación
 *
 * @param req - El objeto Request con uid en el body
 * @returns Una respuesta NextResponse confirmando el guardado de la cookie
 * @throws Retorna error implícito si el uid no se proporciona o es inválido
 *
 * @example
 * ```ts
 * POST /api/saveUIDCookie
 * Body: {
 *   "uid": "abc123xyz789"
 * }
 *
 * // Respuesta exitosa:
 * {
 *   "message": "Cookie guardada"
 * }
 *
 * // Cookie establecida:
 * // candidateId=abc123xyz789; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/
 * ```
 *
 * @todo Implementar validaciones de usuario en Firebase
 * @todo Verificar existencia del usuario en la base de datos
 * @todo Validar rol del usuario antes de establecer la cookie
 * @todo Agregar manejo de errores para UIDs inválidos
 *
 * @see {@link getCurrentUser} Para obtener información del usuario autenticado
 * @see {@link getCurrentUserID} Para recuperar solo el ID del usuario desde la cookie
 */
export async function POST(req: Request) {
  // Extrae el UID del usuario desde el cuerpo de la petición
  const { uid } = await req.json();

  // Obtiene la referencia al almacén de cookies
  const cookieStore = await cookies();

  // Establece la cookie con configuración de seguridad
  cookieStore.set("candidateId", uid, {
    httpOnly: true, // Previene acceso desde JavaScript
    secure: process.env.NODE_ENV === "production", // Requiere HTTPS en producción
    sameSite: "strict", // Protección CSRF estricta
    maxAge: 60 * 60 * 24, // Expira en 24 horas (86400 segundos)
    path: "/", // Disponible en toda la aplicación
  });

  return NextResponse.json({ message: "Cookie guardada" });
}
