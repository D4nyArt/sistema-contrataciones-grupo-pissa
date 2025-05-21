import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rhUID = searchParams.get("rhUID");
    if (!rhUID) {
      return NextResponse.json(
        { error: "Missing rhUID query parameter" },
        { status: 400 }
      );
    }

    const snap = await get(ref(database, `usuarios/${rhUID}/revisando`));
    if (!snap.exists()) {
      return NextResponse.json([], { status: 200 });
    }

    const data = snap.val() as Record<string, number>;

    const entries = await Promise.all(
      Object.entries(data).map(async ([candidateUID, timestamp]) => {
        const candidateSnap = await get(ref(database, `usuarios/${candidateUID}`));
        const candidateData = candidateSnap.val();

        return {
          candidateUID,
          since: new Date(timestamp).toISOString(),
          nombre: candidateData?.nombre ?? "",
          apellidos: candidateData?.apellidos ?? "",
          estadoUsuario: candidateData?.estadoUsuario ?? "",
          email: candidateData?.email ?? "",
        };
      })
    );

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error("Error fetching followed list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
