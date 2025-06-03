import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

export async function POST(request: NextRequest) {
  try {
    // 1. Extraer userId desde el header
    const userId = request.headers.get("X-UserId")?.trim();

    if (!userId) {
      return NextResponse.json({ blocked: true }, { status: 401 });
    }

    // 2. Consultar usuario en Firebase Realtime DB
    const snapshot = await get(ref(database, `usuarios/${userId}`));

    // 3. Validar si el usuario existe
    if (!snapshot.exists()) {
      // Podrías devolver también "blocked: true" para evitar fuga de información
      return NextResponse.json({ blocked: true }, { status: 403 });
    }

    const data = snapshot.val();
    const estadoUsuario = data.estadoUsuario;
    const rol = data.rol;

    // 4. Evaluar si está bloqueado
    const isBlocked = (estadoUsuario === "bloqueado" || estadoUsuario === "dado de baja");

    return NextResponse.json({ blocked: isBlocked, role: rol }, { status: 200 });

  } catch (error) {
    console.error("Error al verificar usuario:", error);
    return NextResponse.json({ blocked: true }, { status: 500 });
  }
}
