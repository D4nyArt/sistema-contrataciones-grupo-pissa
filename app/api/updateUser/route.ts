/**
 * updateUser/route.ts
 *
 * Proporciona funcionalidad para actualizar información de usuarios existentes.
 *
 * Este módulo implementa endpoints API para modificar datos específicos de usuarios
 * en Firebase Realtime Database. Permite actualizar campos como teléfono y email
 * secundario utilizando el email principal como identificador único. Incluye
 * validaciones robustas, manejo de errores detallado y logging para debugging.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  update,
} from "firebase/database";

/**
 * Maneja las peticiones PATCH para actualizar información de usuarios.
 *
 * Permite modificar campos específicos de un usuario existente utilizando su
 * email principal como identificador. Soporta actualización de teléfono y
 * email secundario, incluyendo la eliminación del email secundario cuando
 * se envía null. Implementa validaciones estrictas y solo actualiza campos
 * que realmente han cambiado para optimizar operaciones de base de datos.
 *
 * Campos actualizables:
 * - telefono: Número de teléfono del usuario
 * - emailSecundario: Email secundario (puede ser null para eliminarlo)
 *
 * Validaciones implementadas:
 * - targetEmail requerido para identificación
 * - Al menos un campo debe proporcionarse para actualización
 * - Verificación de existencia del usuario
 * - Comparación de valores para evitar actualizaciones innecesarias
 *
 * @param request - El objeto NextRequest con targetEmail, telefono y emailSecundario en el body
 * @returns Una respuesta NextResponse confirmando la actualización o indicando que no hay cambios
 * @throws Retorna error 400 si faltan parámetros requeridos o datos de entrada inválidos
 * @throws Retorna error 404 si el usuario no existe en la base de datos
 * @throws Retorna error 500 si hay problemas de conexión o actualización en Firebase
 *
 * @example
 * ```ts
 * PATCH /api/updateUser
 * Body: {
 *   "targetEmail": "usuario@example.com",
 *   "telefono": "+52 123 456 7890",
 *   "emailSecundario": "secundario@example.com"
 * }
 *
 * // Respuesta exitosa:
 * {
 *   "message": "Usuario actualizado correctamente.",
 *   "userKey": "usuario123",
 *   "updatesApplied": 2
 * }
 *
 * // Para eliminar email secundario:
 * Body: {
 *   "targetEmail": "usuario@example.com",
 *   "emailSecundario": null
 * }
 *
 * // Sin cambios:
 * {
 *   "message": "No hay cambios que realizar."
 * }
 * ```
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // Parsear el body de la petición
    const body = await request.json();
    const { telefono, emailSecundario, targetEmail } = body;

    // Validación: targetEmail es requerido para identificación
    if (!targetEmail) {
      console.error("Error: targetEmail no proporcionado");
      return NextResponse.json(
        {
          message:
            "El campo targetEmail es requerido para identificar al usuario.",
          received: { telefono, emailSecundario, targetEmail },
        },
        { status: 400 }
      );
    }

    // Validación: al menos un campo debe estar presente para actualizar
    if (telefono === undefined && emailSecundario === undefined) {
      console.error("Error: No se proporcionaron campos para actualizar");
      return NextResponse.json(
        {
          message:
            "Se requiere al menos un campo para actualizar (telefono o emailSecundario).",
          received: { telefono, emailSecundario, targetEmail },
        },
        { status: 400 }
      );
    }

    // Obtener referencia a la base de datos con manejo de errores
    let db;
    try {
      db = getDatabase();
    } catch (dbError) {
      console.error("Error al obtener la base de datos:", dbError);
      return NextResponse.json(
        { message: "Error de configuración de base de datos." },
        { status: 500 }
      );
    }

    // Buscar usuario por email principal
    const usuariosRef = ref(db, "usuarios");
    const q = query(usuariosRef, orderByChild("email"), equalTo(targetEmail));

    let snapshot;
    try {
      snapshot = await get(q);
    } catch (queryError) {
      console.error("Error en la query:", queryError);
      return NextResponse.json(
        { message: "Error al buscar el usuario en la base de datos." },
        { status: 500 }
      );
    }

    // Verificar que el usuario existe
    if (!snapshot.exists()) {
      console.error("Usuario no encontrado con email:", targetEmail);

      // Debug adicional: logging de estructura de datos para troubleshooting
      try {
        const allUsersSnapshot = await get(usuariosRef);
        if (allUsersSnapshot.exists()) {
          let userIndex = 1;
          allUsersSnapshot.forEach((child) => {
            const userData = child.val();
            userIndex++;
            console.debug(`Usuario ${userIndex}, userData:`, userData);
          });
        }
      } catch (debugError) {
        console.error("Error en debug de usuarios:", debugError);
      }

      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Preparar actualizaciones solo para campos que han cambiado
    const updates: Record<string, any> = {};
    let userKey = "";
    let updatedCount = 0;

    snapshot.forEach((child) => {
      userKey = child.key!;
      const userData = child.val();
      const path = `usuarios/${child.key}`;

      // Actualizar teléfono si se proporciona y es diferente del actual
      if (telefono !== undefined && telefono !== userData.telefono) {
        updates[`${path}/telefono`] = telefono;
        updatedCount++;
      }

      // Manejar email secundario (incluyendo eliminación)
      if (emailSecundario !== undefined) {
        if (emailSecundario === null) {
          // Eliminar email secundario si existe
          if (userData.emailSecundario) {
            updates[`${path}/emailSecundario`] = null;
            updatedCount++;
          }
        } else if (emailSecundario !== userData.emailSecundario) {
          // Actualizar email secundario si es diferente
          updates[`${path}/emailSecundario`] = emailSecundario;
          updatedCount++;
        }
      }
    });

    // Verificar si hay cambios que aplicar
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: "No hay cambios que realizar." },
        { status: 200 }
      );
    }

    // Aplicar actualizaciones a Firebase
    try {
      await update(ref(db), updates);
    } catch (updateError) {
      console.error("Error al aplicar actualizaciones:", updateError);
      return NextResponse.json(
        { message: "Error al guardar los cambios en la base de datos." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Usuario actualizado correctamente.",
        userKey: userKey,
        updatesApplied: updatedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    // Logging detallado para debugging
    console.error("=== ERROR CRÍTICO ===");
    console.error("Tipo de error:", typeof error);
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Log adicional para errores específicos de Firebase
    if (error && typeof error === "object" && "code" in error) {
      console.error("Firebase error code:", (error as any).code);
    }

    return NextResponse.json(
      {
        message: "Error interno del servidor.",
        // Incluir detalles del error solo en desarrollo
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : "Unknown error",
          type: typeof error,
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * Maneja las peticiones GET para verificar que el endpoint está funcionando.
 *
 * Función de utilidad para testing y verificación del estado del endpoint.
 * Útil para health checks y verificación de conectividad durante el desarrollo.
 *
 * @returns Una respuesta NextResponse confirmando que la API está operativa
 *
 * @example
 * ```ts
 * GET /api/updateUser
 * // Retorna:
 * {
 *   "message": "UpdateUser API route is working"
 * }
 * ```
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "UpdateUser API route is working" });
}
