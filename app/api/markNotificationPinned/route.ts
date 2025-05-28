import { NextRequest, NextResponse } from "next/server";
import { ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

export async function POST(request: NextRequest) {
  try {
    const { uid, id, pinned } = await request.json();

    if (!uid || !id || typeof pinned !== "boolean") {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }

    const notifRef = ref(database, `notificaciones/notificaciones${uid}/${id}`);

    await update(notifRef, { fijado: pinned });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating pinned status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}