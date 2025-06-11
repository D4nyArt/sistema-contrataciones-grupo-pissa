/**
 * getFollowed/route.ts
 *
 * Proporciona funcionalidad para obtener la lista de candidatos seguidos por un revisor RH.
 *
 * Este módulo implementa un endpoint API que permite a los usuarios de Recursos Humanos
 * obtener una lista completa de todos los candidatos que están actualmente bajo su
 * supervisión o revisión, incluyendo información básica del candidato y metadatos
 * de seguimiento como la fecha de inicio de la supervisión.
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Maneja las peticiones GET para obtener candidatos seguidos por un revisor RH.
 *
 * Recupera la lista completa de candidatos que están siendo supervisados por
 * un usuario específico de Recursos Humanos. Para cada candidato seguido,
 * obtiene información detallada incluyendo datos personales y estado actual.
 *
 * Proceso de recuperación:
 * 1. Valida que se proporcione el ID del revisor RH
 * 2. Consulta la lista de candidatos en revisión del revisor
 * 3. Para cada candidato, obtiene sus datos personales completos
 * 4. Combina la información de seguimiento con los datos del candidato
 * 5. Retorna la lista consolidada con timestamps formateados
 *
 * @param request - El objeto NextRequest con rhUID como query parameter
 * @returns Una respuesta NextResponse con array de candidatos seguidos
 * @throws Retorna error 400 si no se proporciona rhUID
 * @throws Retorna array vacío si el revisor no tiene candidatos asignados
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 *  GET /api/getFollowed?rhUID=rh123
 * // Retorna:
 *  [
 *    {
 *      "candidateUID": "candidato456",
 *      "since": "2024-01-15T10:30:00.000Z",
 *      "nombre": "María",
 *      "apellidos": "González López",
 *      "estadoUsuario": "normal",
 *      "email": "maria.gonzalez@email.com"
 *    }
 *  ]
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extrae el parámetro rhUID de la URL
    const { searchParams } = new URL(request.url);
    const rhUID = searchParams.get("rhUID");

    // Validación de parámetros requeridos
    if (!rhUID) {
      return NextResponse.json(
        { error: "Missing rhUID query parameter" },
        { status: 400 }
      );
    }

    // Obtiene la lista de candidatos en revisión del usuario RH
    const snap = await get(ref(database, `usuarios/${rhUID}/revisando`));
    if (!snap.exists()) {
      return NextResponse.json([], { status: 200 });
    }

    // Extrae los datos de seguimiento (candidateUID -> timestamp)
    const data = snap.val() as Record<string, number>;

    // Para cada candidato seguido, obtiene sus datos personales
    const entries = await Promise.all(
      Object.entries(data).map(async ([candidateUID, timestamp]) => {
        const candidateSnap = await get(
          ref(database, `usuarios/${candidateUID}`)
        );
        const candidateData = candidateSnap.val();

        // Combina datos de seguimiento con información personal
        return {
          candidateUID,
          since: new Date(timestamp).toISOString(),
          nombre: candidateData?.nombre ?? "",
          apellidos: candidateData?.apellidos ?? "",
          estadoUsuario: candidateData?.estadoUsuario ?? "",
          email: candidateData?.email ?? "",
        };
      })
    );

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error("Error fetching followed list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
