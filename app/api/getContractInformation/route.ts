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
      return NextResponse.json({ role, contract: null, state: null });
    }
    const { id: contractId, estado: state } = recSnap.val();

    // Determinar la carpeta y la ruta de datos según el ID del contrato
    let folder = "";
    let dataPath = "";
    if (contractId.startsWith("conproy")) {
      folder = "pruebaInicial/contratos/proyectos";
      dataPath = `contratos/proyectos/${contractId}`;
    } else if (contractId.startsWith("concorp")) {
      folder = "pruebaInicial/contratos/corporativo";
      dataPath = `contratos/corporativo/${contractId}`;
    }

    // 4) obtener información del contrato
    const infoSnap = await get(ref(database, dataPath));
    const info = infoSnap.exists() ? infoSnap.val() : { name: null, url: null };

    return NextResponse.json({
      role,
      state,
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