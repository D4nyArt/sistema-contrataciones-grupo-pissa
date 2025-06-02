import {NextRequest, NextResponse} from "next/server";
import {ref, get, update} from "firebase/database";
import {database} from "@/firebaseConfig";
import sendEmailNotification from "@/app/components/sendEmailNotification";

async function recalcExpedienteCompleto(expId: string) {
  console.log("Recalculando expediente_completo");
  
  const expedienteRef = ref(database, `expedientes/expediente${expId}`);
  const snap = await get(expedienteRef);
  if (!snap.exists()) return;

  const expediente = snap.val() as any;
  const documentos = expediente.documentos || {};

  // Revisar si todos los documentos tienen estadoGeneral === "aprobado"
  const allDocuments = Object.values(documentos) as any[];
  const expedienteCompleto = allDocuments.length > 0 && 
    allDocuments.every(doc => doc.estadoGeneral === "aprobado");

  // Actualizar el campo de expediente_completo
  await update(expedienteRef, { expediente_completo: expedienteCompleto });
  console.log("Expediente completo actualizado:", expedienteCompleto);
}

async function recalcEstadoGeneral(expId: string, docId: string) {
  console.log("Recalculando estado general");

  const path = `expedientes/expediente${expId}/documentos/${docId}`;
  const nodeRef = ref(database, path);
  const snap = await get(nodeRef);
  if (!snap.exists()) return;

  const {estadoArchivo, estadoCampos} = snap.val() as any;
  let nuevo = "no_subido";

  // 1) rechazo lo tiene más peso
  if (estadoArchivo === "rechazado" || estadoCampos === "rechazado") {
    nuevo = "rechazado";

  // 2) cualquiera en pendiente
  } else if (estadoArchivo === "pendiente" || estadoCampos === "pendiente") {
    nuevo = "pendiente";

  // 2.5) uno aprobado y el otro NO aprobado → pendiente
  } else if (
    (estadoArchivo === "aprobado" && estadoCampos !== "aprobado") ||
    (estadoCampos === "aprobado" && estadoArchivo !== "aprobado")
  ) {
    nuevo = "pendiente";

  // 3) solo si ambos aprobados
  } else if (estadoArchivo === "aprobado" && estadoCampos === "aprobado") {
    nuevo = "aprobado";
  }

  // Fix: update the specific node reference
  await update(nodeRef, {estadoGeneral: nuevo});
  console.log("Estado general actualizado:", nuevo);

  // Recalcular expediente completo
  await recalcExpedienteCompleto(expId);
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const expedienteId = p.get("expedienteId");
  const documentoId = p.get("documentoId");

  if (!expedienteId || !documentoId) {
    return NextResponse.json({error: "Faltan IDs"}, {status: 400});
  }

  await recalcEstadoGeneral(expedienteId, documentoId);

  const nodeRef = ref(
    database,
    `expedientes/expediente${expedienteId}/documentos/${documentoId}`
  );
  const snap = await get(nodeRef);
  if (!snap.exists()) {
    return NextResponse.json(
      {error: "No existe el documento"},
      {status: 404}
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

export async function PATCH(request: NextRequest) {
  const {expedienteId, documentoId, estadoArchivo, estadoCampos} =
    await request.json();
  if (!expedienteId || !documentoId) {
    return NextResponse.json({error: "Faltan IDs"}, {status: 400});
  }

  const base = `expedientes/expediente${expedienteId}/documentos/${documentoId}`;
  const updates: Record<string, any> = {};
  if (estadoArchivo !== undefined)
    updates[`${base}/estadoArchivo`] = estadoArchivo;
  if (estadoCampos !== undefined)
    updates[`${base}/estadoCampos`] = estadoCampos;

  if (Object.keys(updates).length) {
    await update(ref(database), updates);

    // Notificaciones (ese si funciona)
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

    // Notificaciones por email
    await sendEmailNotification(
      expedienteId,
      `Estado de documento actualizado - ${documentoId}`,
      `Hola,\n\n${message}\n\nPuedes revisar el estado del expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
    );
  }

  // recalcula siempre
  await recalcEstadoGeneral(expedienteId, documentoId);
  return NextResponse.json({ok: true});
}
