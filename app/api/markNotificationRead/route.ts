import { NextRequest, NextResponse } from "next/server";
import { ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

export async function POST(req: NextRequest) {
  try {
    const { uid, id } = await req.json();

    if (!uid || !id) {
      return NextResponse.json({ error: "Missing uid or id" }, { status: 400 });
    }

    await update(ref(database, `notificaciones/notificaciones${uid}/${id}`), {
      leido: true,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error marking notification as read:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}