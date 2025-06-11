/**
 * users/route.ts
 *
 * Proporciona funcionalidad para obtener todos los usuarios registrados en el sistema.
 *
 * Este módulo implementa un endpoint API que recupera la lista completa de usuarios
 * desde Firebase Realtime Database, incluyendo todos sus datos asociados como
 * información personal, roles, estados y configuraciones. Transforma los datos
 * de Firebase en un formato de array para facilitar su uso en la interfaz de usuario.
 */

import { NextResponse } from "next/server";
import { database } from "../../../firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Maneja las peticiones GET para obtener todos los usuarios del sistema.
 *
 * Recupera la lista completa de usuarios registrados desde Firebase Realtime Database
 * y los transforma en un array estructurado que incluye el ID del usuario junto con
 * todos sus datos asociados. Útil para interfaces administrativas, listados de
 * candidatos, selección de revisores y reportes del sistema.
 *
 * Datos incluidos por usuario:
 * - ID único del usuario
 * - Información personal (nombre, apellidos, email, teléfono)
 * - Rol del usuario (candidato, rh, admin)
 * - Estado del usuario (previo, normal, bloqueado, inhabilitado)
 * - Configuraciones específicas (revisor asignado, candidatos en revisión)
 * - Datos laborales (puesto, área, email corporativo)
 *
 * Casos de uso:
 * - Administración de usuarios por parte de RH/Admin
 * - Selección de revisores para asignación de candidatos
 * - Generación de reportes y estadísticas
 * - Listados de candidatos para supervisión
 *
 * @returns Una respuesta NextResponse con array de todos los usuarios del sistema
 * @throws Retorna array vacío si no existen usuarios en la base de datos
 * @throws Retorna error 500 si hay problemas de conexión con Firebase
 *
 * @example
 * ```ts
 * GET /api/users
 * // Retorna:
 * [
 *   {
 *     "id": "usuario123",
 *     "nombre": "Juan",
 *     "apellidos": "Pérez García",
 *     "email": "juan.perez@example.com",
 *     "rol": "candidato",
 *     "estadoUsuario": "normal",
 *     "revisor": "rh456",
 *     "telefono": "+52 123 456 7890"
 *   },
 *   {
 *     "id": "rh456",
 *     "nombre": "Ana",
 *     "apellidos": "García López",
 *     "email": "ana.garcia@grupopissa.com",
 *     "rol": "rh",
 *     "estadoUsuario": "normal",
 *     "revisando": {
 *       "usuario123": 1640995200000,
 *       "usuario789": 1640995300000
 *     }
 *   }
 * ]
 *
 * // Caso sin usuarios:
 * []
 * ```
 *
 * @see {@link getCurrentUser} Para obtener datos del usuario autenticado
 * @see {@link getFollowed} Para obtener candidatos seguidos por un revisor específico
 */
export async function GET() {
  try {
    // Obtiene todos los usuarios desde Firebase
    const snapshot = await get(ref(database, "usuarios"));

    // Retorna array vacío si no existen usuarios
    if (!snapshot.exists()) return NextResponse.json([], { status: 200 });

    // Transforma los datos de Firebase a formato de array
    const dataValue = snapshot.val();
    const usersArray = Object.entries(dataValue).map(([id, value]) => ({
      id,
      ...(value as Record<string, unknown>),
    }));

    return NextResponse.json(usersArray, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
