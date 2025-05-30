import { NextRequest, NextResponse } from "next/server";
import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";
import sendEmailNotification from "@/app/components/sendEmailNotification";

async function recalcEstadoCampos(expId: string, docId: string) {
  const basePath = `expedientes/expediente${expId}/documentos/${docId}`;
  const camposRef = ref(database, `${basePath}/campos`);
  const snap = await get(camposRef);
  if (!snap.exists()) return;

  const campos = snap.val() as Record<string, { estado: string }>;
  const estados = Object.values(campos).map((c) => c.estado);
  let nuevo: "rechazado" | "pendiente" | "aprobado" | "no_subido" = "no_subido";

  if (estados.includes("rechazado")) {
    nuevo = "rechazado";
  } else if (estados.includes("pendiente")) {
    nuevo = "pendiente";
  } else if (estados.length > 0 && estados.every((e) => e === "aprobado")) {
    nuevo = "aprobado";
  }

  await update(ref(database, basePath), { estadoCampos: nuevo });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const expedienteId = searchParams.get("expedienteId");
    const documentoId = searchParams.get("documentoId");

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

    const fieldsRef = ref(
      database,
      `expedientes/expediente${expedienteId}/documentos/${documentoId}/campos`
    );
    const snapshot = await get(fieldsRef);

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

    if (!expedienteId || !documentoId) {
      return NextResponse.json(
        { error: "Faltan expedienteId o documentoId" },
        { status: 400 }
      );
    }

    const basePath = `expedientes/expediente${expedienteId}/documentos/${documentoId}`;
    const updates: Record<string, any> = {};

    // 1) Si viene un objeto “campos” (guardar todos de golpe)
    if (campos && typeof campos === "object") {
      Object.entries(campos).forEach(([key, data]: any) => {
        updates[`${basePath}/campos/${key}/valor`] = data.valor;
        updates[`${basePath}/campos/${key}/estado`] = data.estado;
      });
    }

    // 2) Si viene un estado global
    if (estadoCampos !== undefined) {
      updates[`${basePath}/estadoCampos`] = estadoCampos;
    }

    // 3) Si vienen cambios puntuales de un solo campo
    if (fieldKey) {
      if (valor !== undefined)
        updates[`${basePath}/campos/${fieldKey}/valor`] = valor;
      if (estado !== undefined)
        updates[`${basePath}/campos/${fieldKey}/estado`] = estado;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay nada para actualizar" },
        { status: 400 }
      );
    }

    await update(ref(database), updates);
    await recalcEstadoCampos(expedienteId, documentoId);

    // Notificaciones
    const timestamp = Date.now();

    if (role !== "candidato") {
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
      // Notificación por email al candidato
      await sendEmailNotification(
        expedienteId,
        `Revisión de campos en tu expediente`,
        `Hola,\n\n${message}.\n\nPuedes revisar el estado de tu expediente ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
      );
    } else {
      const revSnap = await get(
        ref(database, `usuarios/${expedienteId}/revisor`)
      );
      const reviewer = revSnap.exists()
        ? (revSnap.val() as string)
        : "sin_revisor";

      let nombre = "";
      let apellido = "";
      let fullName = expedienteId;

      try {
        const userSnap = await get(ref(database, `usuarios/${expedienteId}`));
        if (userSnap.exists()) {
          const userData = userSnap.val() as {
            nombre?: string;
            apellido?: string;
          };
          nombre = userData.nombre ?? "";
          apellido = userData.apellido ?? "";
          fullName = `${nombre} ${apellido}`.trim();
        }
      } catch (error) {
        console.error("Error al obtener el nombre del candidato:", error);
      }

      const message = `El candidato ${fullName} ha actualizado campos en su expediente`;

      if (reviewer === "sin_revisor") {
        // enviar a todos los RH
        const usersSnap = await get(ref(database, "usuarios"));
        if (usersSnap.exists()) {
          const allUsers = usersSnap.val() as Record<string, { rol?: string }>;
          for (const [userId, userData] of Object.entries(allUsers)) {
            if (userData.rol === "rh") {
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

        // Notificación por email al revisor
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
