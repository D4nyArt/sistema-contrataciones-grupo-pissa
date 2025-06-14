/**
 * markNotificationPinned/route.ts
 *
 * Proporciona funcionalidad para gestionar el estado de fijado de notificaciones.
 *
 * Este módulo implementa un endpoint API que permite a los usuarios marcar o
 * desmarcar notificaciones como fijadas. Las notificaciones fijadas aparecen
 * de forma prominente en la interfaz de usuario para mantener información
 * importante siempre visible.
 */

import { NextRequest, NextResponse } from "next/server";
import { ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Maneja las peticiones POST para actualizar el estado de fijado de una notificación.
 *
 * Permite a los usuarios fijar o desfijar notificaciones específicas cambiando
 * el campo "fijado" en Firebase. Las notificaciones fijadas mantienen mayor
 * visibilidad en la interfaz, útil para mensajes importantes o recordatorios
 * que el usuario desea mantener destacados.
 *
 * Operaciones soportadas:
 * - Fijar notificación: marca una notificación como importante
 * - Desfijar notificación: retorna la notificación a estado normal
 * - Validación de datos: verifica parámetros requeridos y tipos
 *
 * @param request - El objeto NextRequest con uid, id y pinned en el body
 * @returns Una respuesta NextResponse confirmando la actualización
 * @throws Retorna error 400 si faltan uid, id o pinned no es booleano
 * @throws Retorna error 500 si hay problemas de conexión con Firebase
 *
 * @example
 * ```ts
 *  POST /api/markNotificationPinned
 *  Body: {
 *    "uid": "usuario123",
 *    "id": "1640995200000",
 *    "pinned": true
 *  }
 * // Fija la notificación con ID 1640995200000 del usuario123
 *
 * // Respuesta exitosa:
 *  { "success": true }
 *
 * // Para desfijar:
 *  Body: {
 *    "uid": "usuario123",
 *    "id": "1640995200000",
 *    "pinned": false
 * // }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Extrae los datos del cuerpo de la petición
    const { uid, id, pinned } = await request.json();

    // Validación de parámetros requeridos y tipos
    if (!uid || !id || typeof pinned !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid data" },
        { status: 400 }
      );
    }

    // Construye la referencia a la notificación específica
    const notifRef = ref(database, `notificaciones/notificaciones${uid}/${id}`);

    // Actualiza el estado de fijado en Firebase
    await update(notifRef, { fijado: pinned });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating pinned status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
