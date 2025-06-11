/**
 * markNotificationRead/route.ts
 *
 * Proporciona funcionalidad para marcar notificaciones como leídas.
 *
 * Este módulo implementa un endpoint API que permite a los usuarios marcar
 * notificaciones específicas como leídas en Firebase. Una vez marcadas como
 * leídas, las notificaciones cambian su estado visual en la interfaz de usuario
 * para indicar que ya han sido procesadas por el usuario.
 */

import { NextRequest, NextResponse } from "next/server";
import { ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Maneja las peticiones POST para marcar una notificación como leída.
 *
 * Actualiza el campo "leido" de una notificación específica a true en Firebase,
 * indicando que el usuario ha visto y procesado la notificación. Esto permite
 * al sistema mostrar visualmente qué notificaciones son nuevas versus cuáles
 * ya han sido revisadas.
 *
 * Funcionalidad:
 * - Marca notificaciones individuales como leídas
 * - Actualiza el estado en tiempo real en Firebase
 * - Mejora la experiencia de usuario mostrando estado de lectura
 * - Permite gestión eficiente de notificaciones pendientes
 *
 * @param req - El objeto NextRequest con uid e id en el body
 * @returns Una respuesta NextResponse confirmando la actualización
 * @throws Retorna error 400 si faltan uid o id
 * @throws Retorna error 500 si hay problemas de conexión con Firebase
 *
 * @example
 * ```ts
 *  POST /api/markNotificationRead
 *  Body: {
 *    "uid": "usuario123",
 *    "id": "1640995200000"
 *  }
 * // Marca como leída la notificación con ID 1640995200000 del usuario123
 *
 * // Respuesta exitosa:
 *  { "success": true }
 *
 * // Actualización en Firebase:
 *  notificaciones/notificacionesusuario123/1640995200000/leido: true
 * ```
 *
 * @see {@link markNotificationPinned} Para gestionar el estado de fijado de notificaciones
 */
export async function POST(req: NextRequest) {
  try {
    // Extrae los parámetros del cuerpo de la petición
    const { uid, id } = await req.json();

    // Validación de parámetros requeridos
    if (!uid || !id) {
      return NextResponse.json({ error: "Missing uid or id" }, { status: 400 });
    }

    // Actualiza el estado de lectura en Firebase
    await update(ref(database, `notificaciones/notificaciones${uid}/${id}`), {
      leido: true,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error marking notification as read:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
