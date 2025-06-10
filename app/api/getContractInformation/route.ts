import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    // Obtener rol del usuario
    const roleSnap = await get(ref(database, `usuarios/${uid}/rol`));
    const role = roleSnap.exists() ? roleSnap.val() : null;

    // Obtener el contrato activo del usuario
    const recSnap = await get(ref(database, `expedientes/expediente${uid}/contratos`));
    if (!recSnap.exists()) {
      return NextResponse.json({ role, contract: null, state: null, duration: null, notes: null }, { status: 404 });
    }
    const { id: contractId, contrato_activo: active_contract, estado: state, duracion: duration, notas: notes} = recSnap.val();

    // Determinar la carpeta y la ruta de datos según el ID del contrato
    let folder = "pruebaInicial/expedientes/expediente" + uid + "/contratos/preview";
    let dataPath = "expedientes/expediente" + uid + "/contratos/preview/url";

    // 4) obtener información del contrato
    const infoSnap = await get(ref(database, dataPath));
    const info = infoSnap.exists() ? infoSnap.val() : { name: null, url: null };

    return NextResponse.json({
      role,
      state,
      duration,
      active_contract,
      notes,
      contract: {
        id: contractId,
        name: info.name+".pdf",
        url: info.url,
        folder,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}