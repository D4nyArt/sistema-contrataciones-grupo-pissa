import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const snap = await get(ref(database, `notificaciones/notificaciones${uid}`));
    if (!snap.exists()) {
      return NextResponse.json([], { status: 200 });
    }

    const data = snap.val() as Record<string, { mensaje: string; leido: boolean, ruta: string, fijado: boolean }>;
    const notifications = Object.entries(data).map(([id, { mensaje, leido, ruta, fijado }]) => ({
      id,
      message: mensaje,
      read: leido,
      path: ruta,
      pinned: fijado
    }));

    return NextResponse.json(notifications, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}