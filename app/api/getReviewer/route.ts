import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid query parameter" },
        { status: 400 }
      );
    }

    // 1) get the revisor UID (or "sin_revisor")
    const revSnap = await get(ref(database, `usuarios/${uid}/revisor`));
    if (!revSnap.exists()) {
      return NextResponse.json({ revisor: "sin_revisor" }, { status: 200 });
    }

    const revisor = revSnap.val() as string;
    if (revisor === "sin_revisor") {
      return NextResponse.json({ revisor: "sin_revisor" }, { status: 200 });
    }

    // 2) Obtener información del revisor
    const profileSnap = await get(ref(database, `usuarios/${revisor}`));
    if (!profileSnap.exists()) {
      return NextResponse.json(
        { error: "Revisor not found" },
        { status: 404 }
      );
    }
    const profile = profileSnap.val() as {
      nombre?: string;
      apellidos?: string;
      email?: string;
    };

    // 3) Regresar información del revisor
    return NextResponse.json(
      {
        revisorID: revisor,
        nombre: profile.nombre ?? null,
        apellidos: profile.apellidos ?? null,
        email: profile.email ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getReviewer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}