/**
 * fileExpediente/route.ts
 *
 * Proporciona funcionalidad para gestionar archivos de documentos en expedientes.
 *
 * Este módulo implementa endpoints API para obtener información de archivos
 * de documentos y actualizar sus estados de revisión, incluyendo sistema de
 * notificaciones automáticas para informar a candidatos sobre cambios en
 * el estado de sus documentos.
 */

import { NextRequest, NextResponse } from "next/server";
import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";
import sendEmailNotification from "@/app/components/sendEmailNotification";

/**
 * Interfaz que define la estructura de información de un documento.
 */
interface InfoDocumento {
  /** Nombre descriptivo del documento */
  nombre?: string;
  /** URL del archivo subido */
  url?: string;
  /** Estado actual del archivo: 'no_subido' | 'subido' | 'aprobado' | 'rechazado' */
  estadoArchivo?: string;
}

/**
 * Maneja las peticiones GET para obtener información de archivos de documentos.
 *
 * Recupera la información básica de un archivo específico dentro de un documento
 * de expediente, incluyendo nombre, URL y estado actual del archivo.
 *
 * @param request - El objeto NextRequest con expedienteId y documentoId como query parameters
 * @returns Una respuesta NextResponse con la información del archivo o un error
 * @throws Retorna error 400 si faltan expedienteId o documentoId
 * @throws Retorna error 404 si el documento no existe
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 * // GET /api/fileExpediente?expedienteId=123&documentoId=INE
 * // Retorna: { nombre: "INE", url: "https://...", estadoArchivo: "subido" }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const expedienteId = params.get("expedienteId");
    const documentoId = params.get("documentoId");

    // Validación de parámetros requeridos
    if (!expedienteId || !documentoId) {
      return NextResponse.json(
        { error: "Faltan expedienteId o documentoId" },
        { status: 400 }
      );
    }

    // Construye la referencia al documento específico
    const docRef = ref(
      database,
      `expedientes/expediente${expedienteId}/documentos/${documentoId}`
    );
    const snap = await get(docRef);

    // Verifica si el documento existe
    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Extrae solo la información relevante del archivo
    const { nombre, url, estadoArchivo } = snap.val() as InfoDocumento;
    return NextResponse.json({ nombre, url, estadoArchivo });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al recuperar info del archivo" },
      { status: 500 }
    );
  }
}

/**
 * Maneja las peticiones PATCH para actualizar el estado de archivos de documentos.
 *
 * Permite a los revisores RH cambiar el estado de aprobación de archivos subidos
 * por candidatos. Automáticamente envía notificaciones tanto en plataforma como
 * por email al candidato informando sobre el cambio de estado de su documento.
 *
 * Estados válidos:
 * - 'no_subido': El archivo no ha sido subido
 * - 'subido': El archivo fue subido y está pendiente de revisión
 * - 'aprobado': El archivo fue revisado y aprobado por RH
 * - 'rechazado': El archivo fue revisado y rechazado por RH
 *
 * @param request - El objeto NextRequest con expedienteId, documentoId y estadoArchivo en el body
 * @returns Una respuesta NextResponse confirmando la actualización
 * @throws Retorna error 400 si faltan expedienteId, documentoId o estadoArchivo
 * @throws Retorna error 500 si hay problemas durante la actualización
 *
 * @example
 * ```ts
 * // PATCH /api/fileExpediente
 * // Body: {
 * //   "expedienteId": "123",
 * //   "documentoId": "INE",
 * //   "estadoArchivo": "aprobado"
 * // }
 * // Marca el archivo INE como aprobado y notifica al candidato
 * ```
 */
export async function PATCH(request: NextRequest) {
  const { expedienteId, documentoId, estadoArchivo } = await request.json();

  // Validación de parámetros requeridos
  if (!expedienteId || !documentoId || !estadoArchivo) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const docRef = ref(
    database,
    `expedientes/expediente${expedienteId}/documentos/${documentoId}`
  );

  try {
    // Actualiza el estado del archivo en la base de datos
    await update(docRef, { estadoArchivo });

    // Sistema de notificaciones automáticas al candidato
    const timestamp = Date.now();
    const message = `Tu documento "${documentoId}" ha sido marcado como "${estadoArchivo}"`;

    // Notificación en plataforma
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

    // Notificación por email al candidato
    await sendEmailNotification(
      expedienteId,
      `Actualización de documento en tu expediente`,
      `Hola,\n\n${message}.\n\nPuedes revisar el estado del documento ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo actualizar" },
      { status: 500 }
    );
  }
}
