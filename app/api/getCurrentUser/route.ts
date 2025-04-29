import { cookies } from "next/headers";
import { NextResponse } from "next/server"; 
import { ref, get } from 'firebase/database';
import { database } from "@/firebaseConfig";


export async function GET() {
  const dbref = database;


  const cookieStore = await cookies();
  const userId = cookieStore.get("candidateId");
  console.log("userID:", userId);
  const usuariosref = ref(dbref, `/usuarios/${userId?.value}`)
  const usuarios = await get(usuariosref);
  console.log(usuarios.val())

  //console.log(usuarios);
  // Validaciones opcionales: verificar en Firebase que exista el usuario, rol, etc.


  return NextResponse.json(usuarios);
}
