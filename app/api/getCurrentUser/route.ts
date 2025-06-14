import { cookies } from "next/headers";
import { NextResponse } from "next/server"; 
import { ref, get } from 'firebase/database';
import { database } from "@/firebaseConfig";


export async function GET() {
  const dbref = database;


  const cookieStore = await cookies();
  const userId = cookieStore.get("candidateId");
  const usuariosref = ref(dbref, `/usuarios/${userId?.value}`)
  const usuarios = await get(usuariosref);
  // Validaciones opcionales: verificar en Firebase que exista el usuario, rol, etc.


  return NextResponse.json(usuarios);
}
