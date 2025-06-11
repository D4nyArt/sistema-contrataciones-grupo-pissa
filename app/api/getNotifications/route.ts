/**
 * getNotifications/route.ts
 *
 * Proporciona funcionalidad para obtener notificaciones de un usuario específico.
 *
 * Este módulo implementa un endpoint API que recupera todas las notificaciones
 * asociadas a un usuario, incluyendo mensajes, estado de lectura, rutas de
 * navegación y estado de fijado. Transforma los datos de Firebase a un formato
 * consistente para su uso en la interfaz de usuario.
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Maneja las peticiones GET para obtener notificaciones de un usuario.
 *
 * Recupera todas las notificaciones almacenadas para un usuario específico
 * desde Firebase Realtime Database y las transforma a un formato estandarizado.
 * Las notificaciones incluyen información sobre mensajes del sistema, estados
 * de revisión de documentos, y actualizaciones de expedientes.
 *
 * Proceso de recuperación:
 * 1. Valida que se proporcione el UID del usuario
 * 2. Consulta las notificaciones del usuario en Firebase
 * 3. Transforma los datos de español a inglés para consistencia de API
 * 4. Incluye metadatos como ID, estado de lectura y fijado
 * 5. Retorna la lista ordenada de notificaciones
 *
 * @param request - El objeto NextRequest con uid como query parameter
 * @returns Una respuesta NextResponse con array de notificaciones del usuario
 * @throws Retorna error 400 si no se proporciona uid
 * @throws Retorna array vacío si el usuario no tiene notificaciones
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 *  GET /api/getNotifications?uid=123
 * // Retorna:
 *  [
 *    {
 *      "id": "1640995200000",
 *      "message": "Tu documento 'INE' ha sido marcado como 'aprobado'",
 *      "read": false,
 *      "path": "candidato/expediente?tab=expediente",
 *      "pinned": false
 *    },
 *    {
 *      "id": "1640995300000",
 *      "message": "El revisor ha revisado campos en el expediente",
 *      "read": true,
 *      "path": "candidato/expediente?tab=expediente",
 *      "pinned": true
 *    }
 *  ]
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extrae el parámetro uid de la URL
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    // Validación de parámetros requeridos
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    // Consulta las notificaciones del usuario en Firebase
    const snap = await get(
      ref(database, `notificaciones/notificaciones${uid}`)
    );
    if (!snap.exists()) {
      // Retorna array vacío si no hay notificaciones
      return NextResponse.json([], { status: 200 });
    }

    // Transforma los datos de Firebase a formato de API estándar
    const data = snap.val() as Record<
      string,
      { mensaje: string; leido: boolean; ruta: string; fijado: boolean }
    >;
    const notifications = Object.entries(data).map(
      ([id, { mensaje, leido, ruta, fijado }]) => ({
        id,
        message: mensaje,
        read: leido,
        path: ruta,
        pinned: fijado,
      })
    );

    return NextResponse.json(notifications, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
