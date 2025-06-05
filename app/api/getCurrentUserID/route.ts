import { cookies } from "next/headers";
import { NextResponse } from "next/server"; 
import { ref, get } from 'firebase/database';
import { database } from "@/firebaseConfig";


export async function GET() {

  const cookieStore = await cookies();
  const userId = cookieStore.get("candidateId");


  return NextResponse.json(userId);
}
