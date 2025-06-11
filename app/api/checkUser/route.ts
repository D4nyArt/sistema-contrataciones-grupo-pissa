/**
 * route.ts
 * 
 * Proporciona un endpoint API para verificar el estado y rol de un usuario.
 *
 * Este módulo maneja la validación de usuarios autenticados, verificando si están
 * bloqueados o dados de baja, y devolviendo información sobre su rol. Se utiliza
 * para controlar el acceso a diferentes partes de la aplicación basado en el
 * estado del usuario.
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Verifica el estado de bloqueo y rol de un usuario autenticado.
 *
 * Esta función de endpoint API extrae el ID de usuario desde los headers HTTP,
 * consulta la base de datos para obtener el estado y rol del usuario, y determina
 * si el usuario está bloqueado o dado de baja. Se utiliza para validar el acceso
 * continuo del usuario a la aplicación.
 *
 * @param request - El objeto de request de Next.js que contiene el header X-UserId.
 * @returns Una respuesta JSON con el estado de bloqueo y rol del usuario.
 *
 * @example
 * ```ts
 * // Headers del request:
 * // X-UserId: "abc123"
 * 
 * // Respuesta exitosa:
 * // { blocked: false, role: "candidato" }
 * 
 * // Respuesta de usuario bloqueado:
 * // { blocked: true, role: "candidato" }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Extraer userId desde el header
    const userId = request.headers.get("X-UserId")?.trim();

    if (!userId) {
      return NextResponse.json({ blocked: true }, { status: 401 });
    }

    // 2. Consultar usuario en Firebase Realtime DB
    const snapshot = await get(ref(database, `usuarios/${userId}`));

    // 3. Validar si el usuario existe
    if (!snapshot.exists()) {
      // Podrías devolver también "blocked: true" para evitar fuga de información
      return NextResponse.json({ blocked: true }, { status: 403 });
    }

    const data = snapshot.val();
    const estadoUsuario = data.estadoUsuario;
    const rol = data.rol;

    // 4. Evaluar si está bloqueado
    const isBlocked = (estadoUsuario === "bloqueado" || estadoUsuario === "dado de baja");

    return NextResponse.json({ blocked: isBlocked, role: rol }, { status: 200 });

  } catch (error) {
    console.error("Error al verificar usuario:", error);
    return NextResponse.json({ blocked: true }, { status: 500 });
  }
}