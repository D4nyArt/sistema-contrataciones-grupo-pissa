/**
 * notes/route.ts
 *
 * Proporciona funcionalidad para gestionar notas de expedientes de candidatos.
 *
 * Este módulo implementa endpoints API para obtener y actualizar notas asociadas
 * a expedientes específicos. Las notas permiten a los revisores de RH documentar
 * observaciones, comentarios y seguimiento durante el proceso de revisión de
 * candidatos. Incluye sistema de notificaciones automáticas para informar a
 * los candidatos sobre nuevas notas.
 */

import { NextRequest, NextResponse } from "next/server";
import { get, ref, set, update } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Maneja las peticiones GET para obtener notas de un expediente específico.
 *
 * Recupera las notas almacenadas para un expediente particular desde Firebase.
 * Si no existen notas previas, retorna una cadena vacía. Este endpoint es
 * utilizado para mostrar las notas existentes en la interfaz de revisión.
 *
 * @param request - El objeto NextRequest con expedienteId como query parameter
 * @returns Una respuesta NextResponse con las notas del expediente
 * @throws Retorna error 400 si no se proporciona expedienteId
 * @throws Retorna error 500 si hay problemas de conexión con Firebase
 *
 * @example
 * ```ts
 *  GET /api/notes?expedienteId=123
 * // Retorna:
 *  {
 *    "notes": "Candidato con experiencia relevante. Revisar certificaciones."
 *  }
 *
 * // Si no hay notas:
 *  {
 *    "notes": ""
 *  }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extrae el parámetro expedienteId de la URL
    const searchParams = request.nextUrl.searchParams;
    const expedienteId = searchParams.get("expedienteId");

    // Validación de parámetros requeridos
    if (!expedienteId) {
      return NextResponse.json(
        { error: "Se requiere un ID de expediente" },
        { status: 400 }
      );
    }

    // Consulta las notas del expediente en Firebase
    const notesRef = ref(
      database,
      `expedientes/expediente${expedienteId}/notas`
    );
    const snapshot = await get(notesRef);

    // Retorna las notas si existen, cadena vacía si no
    if (snapshot.exists()) {
      return NextResponse.json({ notes: snapshot.val() });
    } else {
      return NextResponse.json({ notes: "" });
    }
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return NextResponse.json(
      { error: "Error al recuperar las notas" },
      { status: 500 }
    );
  }
}

/**
 * Maneja las peticiones POST para crear o actualizar notas de expedientes.
 *
 * Permite a los revisores de RH guardar o actualizar notas asociadas a un
 * expediente específico. Automáticamente envía una notificación al candidato
 * informando sobre la adición de nuevas notas. Las notas se almacenan como
 * texto plano y pueden ser actualizadas múltiples veces.
 *
 * Funcionalidad:
 * - Guardar/actualizar notas de expediente
 * - Notificación automática al candidato
 * - Validación de datos de entrada
 * - Soporte para notas vacías (eliminación efectiva)
 *
 * @param request - El objeto NextRequest con expedienteId y notes en el body
 * @returns Una respuesta NextResponse confirmando el guardado de notas
 * @throws Retorna error 400 si no se proporciona expedienteId
 * @throws Retorna error 500 si hay problemas durante el guardado
 *
 * @example
 * ```ts
 *  POST /api/notes
 *  Body: {
 *    "expedienteId": "123",
 *    "notes": "Candidato con experiencia relevante. Pendiente verificar referencias."
 *  }
 *
 * // Respuesta exitosa:
 *  {
 *    "success": true,
 *    "message": "Notas guardadas correctamente"
 *  }
 *
 * // Notificación automática enviada al candidato:
 * // "Tienes notas nuevas en el expediente"
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    const { expedienteId, notes } = body;

    // Validar datos requeridos
    if (!expedienteId) {
      return NextResponse.json(
        { error: "Se requiere un ID de expediente" },
        { status: 400 }
      );
    }

    // Escribir las notas en Firebase
    const notesRef = ref(
      database,
      `expedientes/expediente${expedienteId}/notas`
    );
    await set(notesRef, notes || "");

    // Sistema de notificaciones automáticas al candidato
    const message = "Tienes notas nuevas en el expediente";
    const timeStamp = Date.now();

    // Envía notificación en plataforma al candidato
    await update(
      ref(database, `notificaciones/notificaciones${expedienteId}`),
      {
        [timeStamp]: {
          mensaje: message,
          leido: false,
          ruta: `candidato/expediente?tab=expediente`,
          fijado: false,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Notas guardadas correctamente",
    });
  } catch (error) {
    console.error("Error al guardar notas:", error);
    return NextResponse.json(
      { error: "Error al guardar las notas" },
      { status: 500 }
    );
  }
}
