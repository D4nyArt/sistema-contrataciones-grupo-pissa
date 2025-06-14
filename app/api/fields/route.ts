/**
 * fields/route.ts
 *
 * Proporciona funcionalidad para gestionar campos de documentos en expedientes.
 *
 * Este módulo implementa endpoints API para obtener y actualizar campos específicos
 * de documentos dentro de expedientes de candidatos, incluyendo sistema de
 * notificaciones automáticas para candidatos y revisores RH.
 */

import { NextRequest, NextResponse } from "next/server";
import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";
import sendEmailNotification from "@/app/components/sendEmailNotification";

/**
 * Tipo que define los posibles estados de los campos de un documento.
 */
type EstadoCampo = "rechazado" | "pendiente" | "aprobado" | "no_subido";

/**
 * Interfaz que define la estructura de datos de usuario para notificaciones.
 */
interface DatosUsuario {
  /** Nombre del usuario */
  nombre?: string;
  /** Apellido del usuario */
  apellido?: string;
  /** Rol del usuario en el sistema */
  rol?: string;
}

/**
 * Interfaz que define la estructura de un campo de documento.
 */
interface CampoDocumento {
  /** Estado actual del campo */
  estado: string;
  /** Valor del campo */
  valor?: string;
}

/**
 * Recalcula automáticamente el estado general de los campos de un documento.
 *
 * Evalúa todos los campos de un documento específico y determina el estado
 * general basado en la lógica de negocio: rechazado si alguno está rechazado,
 * pendiente si alguno está pendiente, aprobado si todos están aprobados.
 *
 * @param expId - ID del expediente
 * @param docId - ID del documento dentro del expediente
 * @returns Promise que se resuelve cuando se actualiza el estado
 *
 * @example
 * ```ts
 * await recalcEstadoCampos("123", "INE");
 * // Recalcula el estado de los campos del documento INE del expediente 123
 * ```
 */
async function recalcEstadoCampos(expId: string, docId: string): Promise<void> {
  const basePath = `expedientes/expediente${expId}/documentos/${docId}`;
  const camposRef = ref(database, `${basePath}/campos`);
  const snap = await get(camposRef);

  // Si no existen campos, no hay nada que recalcular
  if (!snap.exists()) return;

  const campos = snap.val() as Record<string, CampoDocumento>;
  const estados = Object.values(campos).map((c) => c.estado);
  let nuevo: EstadoCampo = "no_subido";

  // Lógica de evaluación de estados
  if (estados.includes("rechazado")) {
    nuevo = "rechazado";
  } else if (estados.includes("pendiente")) {
    nuevo = "pendiente";
  } else if (estados.length > 0 && estados.every((e) => e === "aprobado")) {
    nuevo = "aprobado";
  }

  // Actualiza el estado calculado en la base de datos
  await update(ref(database, basePath), { estadoCampos: nuevo });
}

/**
 * Maneja las peticiones GET para obtener campos de un documento específico.
 *
 * Recupera todos los campos de un documento dentro de un expediente,
 * útil para mostrar formularios de edición o visualización de datos.
 *
 * @param request - El objeto NextRequest con expedienteId y documentoId como query parameters
 * @returns Una respuesta NextResponse con los campos del documento o un error
 * @throws Retorna error 400 si faltan expedienteId o documentoId
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 * // GET /api/fields?expedienteId=123&documentoId=INE
 * // Retorna todos los campos del documento INE del expediente 123
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const expedienteId = searchParams.get("expedienteId");
    const documentoId = searchParams.get("documentoId");

    // Validación de parámetros requeridos
    if (!expedienteId) {
      return NextResponse.json(
        { error: "Se requiere un ID de expediente" },
        { status: 400 }
      );
    }

    if (!documentoId) {
      return NextResponse.json(
        { error: "Se requiere un ID de documento" },
        { status: 400 }
      );
    }

    // Construye la referencia a los campos del documento
    const fieldsRef = ref(
      database,
      `expedientes/expediente${expedienteId}/documentos/${documentoId}/campos`
    );
    const snapshot = await get(fieldsRef);

    // Retorna los campos si existen, cadena vacía si no
    if (snapshot.exists()) {
      return NextResponse.json({ fields: snapshot.val() });
    } else {
      return NextResponse.json({ fields: "" });
    }
  } catch {
    return NextResponse.json(
      { error: "Error al obtener los campos" },
      { status: 500 }
    );
  }
}

/**
 * Maneja las peticiones PATCH para actualizar campos de documentos.
 *
 * Permite actualizar campos individuales o múltiples campos de un documento,
 * incluyendo valores y estados. Automáticamente recalcula el estado general
 * del documento y envía notificaciones relevantes a candidatos y revisores.
 * Soporta tres modos de operación:
 * 1. Actualización masiva de múltiples campos
 * 2. Actualización del estado general de campos
 * 3. Actualización de un campo específico
 *
 * @param request - El objeto NextRequest con los datos de actualización en el body
 * @returns Una respuesta NextResponse confirmando la actualización
 * @throws Retorna error 400 si faltan expedienteId, documentoId o no hay datos para actualizar
 * @throws Retorna error 500 si hay problemas durante la actualización
 *
 * @example
 * ```ts
 * // PATCH /api/fields
 * // Body: {
 * //   "expedienteId": "123",
 * //   "documentoId": "INE",
 * //   "fieldKey": "nombreCompleto",
 * //   "valor": "Juan Pérez",
 * //   "estado": "pendiente",
 * //   "role": "candidato"
 * // }
 * // Actualiza el campo nombreCompleto del documento INE
 * ```
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      expedienteId,
      documentoId,
      campos,
      estadoCampos,
      fieldKey,
      valor,
      estado,
      role,
    } = body;

    // Validación de parámetros críticos
    if (!expedienteId || !documentoId) {
      return NextResponse.json(
        { error: "Faltan expedienteId o documentoId" },
        { status: 400 }
      );
    }

    const basePath = `expedientes/expediente${expedienteId}/documentos/${documentoId}`;
    const updates: Record<string, any> = {};

    // Modo 1: Actualización masiva de múltiples campos
    if (campos && typeof campos === "object") {
      Object.entries(campos).forEach(([key, data]: any) => {
        updates[`${basePath}/campos/${key}/valor`] = data.valor;
        updates[`${basePath}/campos/${key}/estado`] = data.estado;
      });
    }

    // Modo 2: Actualización del estado general de campos
    if (estadoCampos !== undefined) {
      updates[`${basePath}/estadoCampos`] = estadoCampos;
    }

    // Modo 3: Actualización de un campo específico
    if (fieldKey) {
      if (valor !== undefined)
        updates[`${basePath}/campos/${fieldKey}/valor`] = valor;
      if (estado !== undefined)
        updates[`${basePath}/campos/${fieldKey}/estado`] = estado;
    }

    // Verifica que hay cambios para aplicar
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay nada para actualizar" },
        { status: 400 }
      );
    }

    // Aplica las actualizaciones y recalcula el estado general
    await update(ref(database), updates);
    await recalcEstadoCampos(expedienteId, documentoId);

    // Sistema de notificaciones automáticas
    const timestamp = Date.now();

    if (role !== "candidato") {
      // Notificación al candidato cuando RH revisa campos
      const message = `El revisor ha revisado campos en el expediente`;
      await update(
        ref(database, `notificaciones/notificaciones${expedienteId}`),
        {
          [timestamp]: {
            mensaje: message,
            leido: false,
            ruta: `candidato/expediente?tab=expediente`,
            fijado: false,
          },
        }
      );

      // Envío de email al candidato
      await sendEmailNotification(
        expedienteId,
        `Revisión de campos en tu expediente`,
        `Hola,\n\n${message}.\n\nPuedes revisar el estado de tu expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
      );
    } else {
      // Notificación a RH cuando candidato actualiza campos
      const revSnap = await get(
        ref(database, `usuarios/${expedienteId}/revisor`)
      );
      const reviewer = revSnap.exists()
        ? (revSnap.val() as string)
        : "sin_revisor";

      // Obtiene el nombre completo del candidato para personalizar notificaciones
      let nombre = "";
      let apellido = "";
      let fullName = expedienteId;

      try {
        const userSnap = await get(ref(database, `usuarios/${expedienteId}`));
        if (userSnap.exists()) {
          const userData = userSnap.val() as DatosUsuario;
          nombre = userData.nombre ?? "";
          apellido = userData.apellido ?? "";
          fullName = `${nombre} ${apellido}`.trim();
        }
      } catch (error) {
        console.error("Error al obtener el nombre del candidato:", error);
      }

      const message = `El candidato ${fullName} ha actualizado campos en su expediente`;

      if (reviewer === "sin_revisor") {
        // Envía notificación a todos los usuarios RH
        const usersSnap = await get(ref(database, "usuarios"));
        if (usersSnap.exists()) {
          const allUsers = usersSnap.val() as Record<string, DatosUsuario>;
          for (const [userId, userData] of Object.entries(allUsers)) {
            if (userData.rol === "rh") {
              // Notificación en plataforma
              await update(
                ref(database, `notificaciones/notificaciones${userId}`),
                {
                  [timestamp]: {
                    mensaje: message,
                    leido: false,
                    ruta: `dashboard/${expedienteId}?tab=expediente`,
                    fijado: false,
                  },
                }
              );

              // Notificación por email a cada persona RH
              await sendEmailNotification(
                userId,
                `Actualización de campos en expediente de ${fullName}`,
                `Hola,\n\n${message}\n\nPuedes revisar el estado del expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
              );
            }
          }
        }
      } else {
        // Envía notificación solo al revisor asignado
        await update(
          ref(database, `notificaciones/notificaciones${reviewer}`),
          {
            [timestamp]: {
              mensaje: message,
              leido: false,
              ruta: `dashboard/${expedienteId}?tab=expediente`,
              fijado: false,
            },
          }
        );

        // Notificación por email al revisor específico
        await sendEmailNotification(
          reviewer,
          `Actualización de campos en expediente de ${fullName}`,
          `Hola,\n\n${message}\n\nPuedes revisar el estado del expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo actualizar" },
      { status: 500 }
    );
  }
}
