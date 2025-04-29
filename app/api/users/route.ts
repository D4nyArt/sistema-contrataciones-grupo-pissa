import { NextResponse } from "next/server";
import { database } from "../../../firebaseConfig";
import { ref, get } from "firebase/database";

export async function GET() {
  try {
    const snapshot = await get(ref(database, "usuarios"));
    if (!snapshot.exists()) return NextResponse.json([], { status: 200 });

    const dataValue = snapshot.val();
    const usersArray = Object.entries(dataValue).map(([id, value]) => ({
      id,
      // TODO
      // "any" still triggers an error but "unknown" type doesnt work either, maybe string ???
      ...(value as any),
    }));

    return NextResponse.json(usersArray, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}
