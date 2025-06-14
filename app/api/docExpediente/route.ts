/**
 * route.ts
 * 
 * Proporciona endpoints API para gestionar documentos de expedientes y su estado.
 *
 * Este módulo maneja la obtención y actualización del estado de documentos individuales
 * dentro de expedientes de candidatos. Incluye funcionalidad para recalcular automáticamente
 * el estado general de documentos y determinar si un expediente está completo. También
 * gestiona notificaciones a candidatos cuando cambia el estado de sus documentos.
 */

import {NextRequest, NextResponse} from "next/server";
import {ref, get, update} from "firebase/database";
import {database} from "@/firebaseConfig";
import sendEmailNotification from "@/app/components/sendEmailNotification";

/**
 * Recalcula si un expediente está completo basándose en el estado de todos sus documentos.
 *
 * Esta función verifica si todos los documentos de un expediente tienen estado "aprobado"
 * y actualiza el campo expediente_completo accordingly. Un expediente se considera completo
 * solo cuando todos sus documentos han sido aprobados.
 *
 * @param expId - El ID del expediente a verificar.
 *
 * @example
 * ```ts
 * await recalcExpedienteCompleto("abc123");
 * // Actualiza expedientes/expedienteabc123/expediente_completo
 * ```
 */
async function recalcExpedienteCompleto(expId: string) {
  const expedienteRef = ref(database, `expedientes/expediente${expId}`);
  const snap = await get(expedienteRef);
  if (!snap.exists()) return;

  const expediente = snap.val() as any;
  const documentos = expediente.documentos || {};

  // Revisar si todos los documentos tienen estadoGeneral === "aprobado"
  const allDocuments = Object.values(documentos) as any[];
  const expedienteCompleto =
    allDocuments.length > 0 &&
    allDocuments.every((doc) => doc.estadoGeneral === "aprobado");

  // Actualizar el campo de expediente_completo
  await update(expedienteRef, { expediente_completo: expedienteCompleto });
}

/**
 * Recalcula el estado general de un documento específico basándose en sus estados de archivo y campos.
 *
 * Esta función evalúa los estados de archivo y campos de un documento para determinar su estado
 * general siguiendo reglas de prioridad: rechazado > pendiente > aprobado. También maneja
 * documentos sin campos asignándoles automáticamente estado "aprobado" para campos.
 *
 * @param expId - El ID del expediente que contiene el documento.
 * @param docId - El ID del documento a recalcular.
 *
 * @example
 * ```ts
 * await recalcEstadoGeneral("abc123", "cedula");
 * // Recalcula el estadoGeneral del documento "cedula"
 * ```
 */
async function recalcEstadoGeneral(expId: string, docId: string) {
  const path = `expedientes/expediente${expId}/documentos/${docId}`;
  const nodeRef = ref(database, path);

  // 1) Si no hay campos o está vacío → estadoCampos = "aprobado"
  const camposRef = ref(database, `${path}/campos`);
  const camposSnap = await get(camposRef);
  if (
    !camposSnap.exists() ||
    Object.keys(camposSnap.val() || {}).length === 0
  ) {
    await update(nodeRef, { estadoCampos: "aprobado" });
  }

  // 2) Recalcular estadoGeneral
  const snap = await get(nodeRef);
  if (!snap.exists()) return;
  const { estadoArchivo, estadoCampos } = snap.val() as any;

  let nuevo: "aprobado" | "pendiente" | "rechazado" | "no_subido" = "no_subido";
  if (estadoArchivo === "rechazado" || estadoCampos === "rechazado") {
    nuevo = "rechazado";
  } else if (estadoArchivo === "pendiente" || estadoCampos === "pendiente") {
    nuevo = "pendiente";
  } else if (estadoArchivo === "aprobado" && estadoCampos === "aprobado") {
    nuevo = "aprobado";
  }

  await update(nodeRef, { estadoGeneral: nuevo });
  await recalcExpedienteCompleto(expId);
}

/**
 * Obtiene la información actualizada de un documento específico de expediente.
 *
 * Este endpoint recalcula automáticamente el estado general del documento antes de
 * devolver la información, asegurando que los datos estén siempre actualizados.
 * Retorna el nombre del documento y todos sus estados relevantes.
 *
 * @param request - El objeto de request que contiene expedienteId y documentoId como parámetros de consulta.
 * @returns Una respuesta JSON con la información del documento.
 *
 * @example
 * ```ts
 * GET /api/docExpediente?expedienteId=abc123&documentoId=cedula
 * // Respuesta:
 * {
 *   nombre: "Cédula de Identidad",
 *   estadoArchivo: "aprobado",
 *   estadoCampos: "pendiente",
 *   estadoGeneral: "pendiente"
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const expedienteId = p.get("expedienteId");
  const documentoId = p.get("documentoId");
  if (!expedienteId || !documentoId) {
    return NextResponse.json({ error: "Faltan IDs" }, { status: 400 });
  }

  await recalcEstadoGeneral(expedienteId, documentoId);
  const nodeRef = ref(
    database,
    `expedientes/expediente${expedienteId}/documentos/${documentoId}`
  );
  const snap = await get(nodeRef);
  if (!snap.exists()) {
    return NextResponse.json(
      { error: "No existe el documento" },
      { status: 404 }
    );
  }
  const data = snap.val() as any;
  return NextResponse.json({
    nombre: data.nombre,
    estadoArchivo: data.estadoArchivo,
    estadoCampos: data.estadoCampos,
    estadoGeneral: data.estadoGeneral,
  });
}

/**
 * Actualiza el estado de archivo y/o campos de un documento específico.
 *
 * Este endpoint permite actualizar selectivamente los estados de un documento y
 * envía notificaciones automáticas al candidato sobre los cambios. Siempre recalcula
 * el estado general del documento después de las actualizaciones para mantener
 * la consistencia de datos.
 *
 * @param request - El objeto de request que contiene expedienteId, documentoId y los nuevos estados.
 * @returns Una respuesta JSON confirmando la actualización exitosa.
 *
 * @example
 * ```ts
 * PATCH /api/docExpediente
 * // Body: {
 *    expedienteId: "abc123",
 *    documentoId: "cedula", 
 *    estadoArchivo: "aprobado"
 *  }
 * Respuesta: { ok: true }
 * ```
 */
export async function PATCH(request: NextRequest) {
  const { expedienteId, documentoId, estadoArchivo, estadoCampos } =
    await request.json();
  if (!expedienteId || !documentoId) {
    return NextResponse.json({ error: "Faltan IDs" }, { status: 400 });
  }

  const base = `expedientes/expediente${expedienteId}/documentos/${documentoId}`;
  const updates: Record<string, any> = {};
  if (estadoArchivo !== undefined)
    updates[`${base}/estadoArchivo`] = estadoArchivo;
  if (estadoCampos !== undefined)
    updates[`${base}/estadoCampos`] = estadoCampos;

  if (Object.keys(updates).length) {
    await update(ref(database), updates);

    // Notificación al candidato
    const timestamp = Date.now();
    const message = `Tu documento "${documentoId}" ha sido marcado como "${estadoArchivo}"`;
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
    await sendEmailNotification(
      expedienteId,
      `Estado de documento actualizado - ${documentoId}`,
      `Hola,\n\n${message}\n\nPuedes revisar el estado del expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
    );
  }

  // Siempre recalcular estadoGeneral
  await recalcEstadoGeneral(expedienteId, documentoId);
  return NextResponse.json({ ok: true });
}
