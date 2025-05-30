import { NextRequest, NextResponse } from "next/server";
import { ref, get, update } from "firebase/database";
import { database } from "@/firebaseConfig";

async function recalcEstadoGeneral(expId: string, docId: string) {
  console.log("Recalculando estado general");

  const path = `expedientes/expediente${expId}/documentos/${docId}`;
  const nodeRef = ref(database, path);
  const snap = await get(nodeRef);
  if (!snap.exists()) return;

  const { estadoArchivo, estadoCampos } = snap.val() as any;
  let nuevo = "no_subido";

  // 1) rechazo lo tiene más peso
  if (estadoArchivo === "rechazado" || estadoCampos === "rechazado") {
    nuevo = "rechazado";

    // 2) cualquiera en pendiente
  } else if (estadoArchivo === "pendiente" || estadoCampos === "pendiente") {
    nuevo = "pendiente";

    // 3) solo si ambos aprobados
  } else if (estadoArchivo === "aprobado" && estadoCampos === "aprobado") {
    nuevo = "aprobado";
  }

  // Fix: update the specific node reference
  await update(nodeRef, { estadoGeneral: nuevo });
  console.log("Estado general actualizado:", nuevo);
}

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
    try {
      // Get user email from database
      const userRef = ref(database, `usuarios/${expedienteId}/email`);
      const userSnap = await get(userRef);

      if (userSnap.exists()) {
        const userEmail = userSnap.val();

        // Send email notification
        const emailResponse = await fetch("/api/sendEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addressee: userEmail,
            subject: `Estado de documento actualizado - ${documentoId}`,
            text: `Hola,\n\n${message}\n\nPuedes revisar el estado de tu expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Error sending email notification");
        }
      }
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  // recalcula siempre
  await recalcEstadoGeneral(expedienteId, documentoId);
  return NextResponse.json({ ok: true });
}
