import { cookies } from "next/headers";
import { NextResponse } from "next/server"; 
import { getDatabase, ref, get, child} from 'firebase/database';
import { database } from "@/firebaseConfig";


export async function POST(req: Request) {
  const { uid } = await req.json();
  const dbref = database;



  //console.log(usuarios);
  // Validaciones opcionales: verificar en Firebase que exista el usuario, rol, etc.

  const cookieStore = await cookies();
  cookieStore.set("candidateId", uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 día
    path: "/",
  });

  return NextResponse.json({ message: "Cookie guardada" });
}
