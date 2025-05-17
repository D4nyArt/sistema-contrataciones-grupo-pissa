import { NextResponse } from "next/server";
import { database } from "../../../firebaseConfig";
import { ref, get } from "firebase/database";

export async function GET() {
  try {
    const snapshot = await get(ref(database, "contratos/corporativo"));
    if (!snapshot.exists()) return NextResponse.json([], { status: 200 });

    const dataValue = snapshot.val();
    const usersArray = Object.entries(dataValue).map(([id, value]) => ({
      id,
      ...(value as Record<string, unknown>),
    }));

    const snapshot2 = await get(ref(database, "contratos/proyectos"));
    
    if (!snapshot.exists()) return NextResponse.json([], { status: 200 });

    const dataValue2 = snapshot2.val();
    const usersArray2 = Object.entries(dataValue2).map(([id, value]) => ({
      id,
      ...(value as Record<string, unknown>),
    }));

    const usersArray_final = usersArray.concat(usersArray2);
    console.log(usersArray_final);


    return NextResponse.json(usersArray_final, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
  }
}
