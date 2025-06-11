/**
 * getReviewer/route.ts
 *
 * Proporciona funcionalidad para obtener información del revisor asignado a un candidato.
 *
 * Este módulo implementa un endpoint API que recupera los datos completos del
 * revisor de Recursos Humanos que está asignado a un candidato específico,
 * incluyendo información personal del revisor como nombre, apellidos y email.
 * Maneja casos especiales donde no existe revisor asignado.
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Maneja las peticiones GET para obtener información del revisor asignado.
 *
 * Recupera la información completa del revisor de RH que está asignado a
 * un candidato específico. Si no existe revisor asignado, retorna el estado
 * "sin_revisor". Si existe revisor, obtiene sus datos personales completos
 * desde la base de datos.
 *
 * Proceso de recuperación:
 * 1. Valida que se proporcione el UID del candidato
 * 2. Consulta el revisor asignado al candidato
 * 3. Maneja el caso especial "sin_revisor"
 * 4. Obtiene los datos personales del revisor desde su perfil
 * 5. Retorna la información completa del revisor
 *
 * @param request - El objeto NextRequest con uid como query parameter
 * @returns Una respuesta NextResponse con información del revisor o estado "sin_revisor"
 * @throws Retorna error 400 si no se proporciona uid
 * @throws Retorna error 404 si el revisor asignado no existe en la base de datos
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 *  GET /api/getReviewer?uid=candidato123
 * // Caso 1: Candidato con revisor asignado
 * // Retorna:
 *  {
 *    "revisorID": "rh456",
 *    "nombre": "Ana",
 *    "apellidos": "García López",
 *    "email": "ana.garcia@grupopissa.com"
 *  }
 *
 * // Caso 2: Candidato sin revisor asignado
 * // Retorna:
 *  {
 *    "revisor": "sin_revisor"
 *  }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extrae el parámetro uid de la URL
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    // Validación de parámetros requeridos
    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid query parameter" },
        { status: 400 }
      );
    }

    // 1) Obtiene el UID del revisor asignado (o "sin_revisor")
    const revSnap = await get(ref(database, `usuarios/${uid}/revisor`));
    if (!revSnap.exists()) {
      return NextResponse.json({ revisor: "sin_revisor" }, { status: 200 });
    }

    const revisor = revSnap.val() as string;
    if (revisor === "sin_revisor") {
      return NextResponse.json({ revisor: "sin_revisor" }, { status: 200 });
    }

    // 2) Obtiene información personal del revisor
    const profileSnap = await get(ref(database, `usuarios/${revisor}`));
    if (!profileSnap.exists()) {
      return NextResponse.json({ error: "Revisor not found" }, { status: 404 });
    }

    // Extrae los datos del perfil del revisor
    const profile = profileSnap.val() as {
      nombre?: string;
      apellidos?: string;
      email?: string;
    };

    // 3) Retorna información completa del revisor
    return NextResponse.json(
      {
        revisorID: revisor,
        nombre: profile.nombre ?? null,
        apellidos: profile.apellidos ?? null,
        email: profile.email ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getReviewer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
