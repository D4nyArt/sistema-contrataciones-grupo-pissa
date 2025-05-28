// app/api/updateUser/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ref, query, orderByChild, equalTo, get, update } from "firebase/database";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("=== Iniciando actualización de usuario ===");
    
    // Parsear el body
    const body = await request.json();
    console.log("Body recibido:", JSON.stringify(body, null, 2));
    
    const { email, telefono, targetEmail } = body;

    // Validaciones mejoradas
    if (!targetEmail) {
      console.error("Error: targetEmail no proporcionado");
      return NextResponse.json(
        { 
          message: "El campo targetEmail es requerido para identificar al usuario.",
          received: { email, telefono, targetEmail }
        },
        { status: 400 }
      );
    }

    if (!email && !telefono) {
      console.error("Error: No se proporcionaron campos para actualizar");
      return NextResponse.json(
        { 
          message: "Se requiere al menos un campo para actualizar (email o telefono).",
          received: { email, telefono, targetEmail }
        },
        { status: 400 }
      );
    }

    console.log("Validaciones pasadas");
    console.log("Target email:", targetEmail);
    console.log("Nuevo email:", email || "sin cambios");
    console.log("Nuevo teléfono:", telefono || "sin cambios");

    // Obtener referencia a la base de datos
    let db;
    try {
      db = getDatabase();
      console.log("Base de datos obtenida correctamente");
    } catch (dbError) {
      console.error("Error al obtener la base de datos:", dbError);
      return NextResponse.json(
        { message: "Error de configuración de base de datos." },
        { status: 500 }
      );
    }

    // Buscar usuario
    console.log("Buscando usuario en la base de datos...");
    const usuariosRef = ref(db, "usuarios");
    const q = query(usuariosRef, orderByChild("email"), equalTo(targetEmail));
    
    let snapshot;
    try {
      snapshot = await get(q);
      console.log("Query ejecutada, snapshot exists:", snapshot.exists());
    } catch (queryError) {
      console.error("Error en la query:", queryError);
      return NextResponse.json(
        { message: "Error al buscar el usuario en la base de datos." },
        { status: 500 }
      );
    }

    if (!snapshot.exists()) {
      console.error("Usuario no encontrado con email:", targetEmail);
      
      // Debug adicional: verificar estructura de datos
      try {
        const allUsersSnapshot = await get(usuariosRef);
        if (allUsersSnapshot.exists()) {
          console.log("Usuarios existentes en la base de datos:");
          let userIndex = 1;
          allUsersSnapshot.forEach((child) => {
            const userData = child.val();
            console.log(`Usuario ${userIndex}:`, {
              key: child.key,
              email: userData.email,
              // Solo mostrar otros campos para debug si existen
              ...(userData.nombre && { nombre: userData.nombre }),
              ...(userData.telefono && { telefono: userData.telefono })
            });
            userIndex++;
          });
        } else {
          console.log("No hay usuarios en la base de datos");
        }
      } catch (debugError) {
        console.error("Error en debug de usuarios:", debugError);
      }
      
      return NextResponse.json(
        { message: "Usuario no encontrado." }, 
        { status: 404 }
      );
    }

    console.log("Usuario encontrado, preparando actualizaciones...");

    // Preparar actualizaciones
    const updates: Record<string, any> = {};
    let userKey = "";
    let updatedCount = 0;
    
    snapshot.forEach((child) => {
      userKey = child.key!;
      const userData = child.val();
      console.log("Datos actuales del usuario:", userData);
      
      const path = `usuarios/${child.key}`;
      
      if (email && email !== userData.email) {
        updates[`${path}/email`] = email;
        console.log(`Programando actualización de email: ${userData.email} → ${email}`);
        updatedCount++;
      }
      
      if (telefono && telefono !== userData.telefono) {
        updates[`${path}/telefono`] = telefono;
        console.log(`Programando actualización de teléfono: ${userData.telefono || 'vacío'} → ${telefono}`);
        updatedCount++;
      }
    });

    if (updatedCount === 0) {
      console.log("No hay cambios que realizar");
      return NextResponse.json(
        { message: "No hay cambios que realizar." },
        { status: 200 }
      );
    }

    console.log("Updates a aplicar:", JSON.stringify(updates, null, 2));

    // Aplicar actualizaciones
    try {
      await update(ref(db), updates);
      console.log("Actualizaciones aplicadas correctamente");
    } catch (updateError) {
      console.error("Error al aplicar actualizaciones:", updateError);
      return NextResponse.json(
        { message: "Error al guardar los cambios en la base de datos." },
        { status: 500 }
      );
    }

    console.log("=== Usuario actualizado correctamente ===");

    return NextResponse.json(
      { 
        message: "Usuario actualizado correctamente.",
        userKey: userKey,
        updatesApplied: updatedCount
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("=== ERROR CRÍTICO ===");
    console.error("Tipo de error:", typeof error);
    console.error("Error name:", error instanceof Error ? error.name : 'Unknown');
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Log adicional para errores de Firebase
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Firebase error code:", (error as any).code);
    }
    
    return NextResponse.json(
      { 
        message: "Error interno del servidor.",
        ...(process.env.NODE_ENV === 'development' && {
          error: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error
        })
      }, 
      { status: 500 }
    );
  }
}

// Función de prueba para verificar que la ruta funciona
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: "UpdateUser API route is working" });
}