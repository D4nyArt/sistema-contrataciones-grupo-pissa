import { NextRequest, NextResponse } from 'next/server';
import { get, ref, set } from "firebase/database";
import { database } from "@/firebaseConfig";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const expedienteId = searchParams.get('expedienteId');
    
    if (!expedienteId) {
      return NextResponse.json(
        { error: 'Se requiere un ID de expediente' }, 
        { status: 400 }
      );
    }

    const notesRef = ref(database, `expedientes/expediente${expedienteId}/notas`);
    const snapshot = await get(notesRef);
    
    if (snapshot.exists()) {
      return NextResponse.json({ notes: snapshot.val() });
    } else {
      return NextResponse.json({ notes: "" });
    }
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return NextResponse.json(
      { error: 'Error al recuperar las notas' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    const { expedienteId, notes } = body;
    
    // Validar datos
    if (!expedienteId) {
      return NextResponse.json(
        { error: 'Se requiere un ID de expediente' }, 
        { status: 400 }
      );
    }
    
    // Escribir en Firebase
    const notesRef = ref(database, `expedientes/expediente${expedienteId}/notas`);
    await set(notesRef, notes || "");
    
    return NextResponse.json({ success: true, message: 'Notas guardadas correctamente' });
  } catch (error) {
    console.error("Error al guardar notas:", error);
    return NextResponse.json(
      { error: 'Error al guardar las notas' }, 
      { status: 500 }
    );
  }
}