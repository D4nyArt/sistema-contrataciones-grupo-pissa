/**
 * getCurrentUser/route.ts
 *
 * Proporciona funcionalidad para obtener información del usuario autenticado actualmente.
 *
 * Este módulo implementa un endpoint API que recupera los datos completos del usuario
 * que está actualmente autenticado en la sesión, utilizando cookies de sesión para
 * identificar al usuario y obtener sus datos desde Firebase Realtime Database.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Maneja las peticiones GET para obtener información del usuario autenticado.
 *
 * Recupera los datos completos del usuario que está actualmente en sesión
 * utilizando el ID almacenado en la cookie "candidateId". Retorna toda la
 * información disponible del usuario desde la base de datos Firebase.
 *
 * Flujo de autenticación:
 * 1. Obtiene la referencia a la base de datos Firebase
 * 2. Extrae el ID del usuario desde la cookie "candidateId"
 * 3. Consulta Firebase para obtener los datos completos del usuario
 * 4. Retorna la información del usuario en formato JSON
 *
 * @returns Una respuesta NextResponse con los datos completos del usuario autenticado
 * @throws Retorna datos del snapshot si la cookie existe pero el usuario no se encuentra
 * @throws Retorna error implícito si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 * // GET /api/getCurrentUser
 * // Retorna:
 * // {
 * //   "nombre": "Juan",
 * //   "apellidos": "Pérez García",
 * //   "email": "juan.perez@personal.com",
 * //   "email_corporativo": "juan.perez@grupopissa.com",
 * //   "rol": "candidato",
 * //   "telefono": "+52 123 456 7890",
 * //   "estadoUsuario": "normal",
 * //   "contrato_activo": "conproy001"
 * // }
 * ```
 */
export async function GET() {
  // Obtiene la referencia a la base de datos Firebase
  const dbref = database;

  // Recupera las cookies de la sesión actual
  const cookieStore = await cookies();
  const userId = cookieStore.get("candidateId");

  // Construye la referencia al usuario específico en Firebase
  const usuariosref = ref(dbref, `/usuarios/${userId?.value}`);

  // Obtiene los datos del usuario desde Firebase
  const usuarios = await get(usuariosref);

  // Retorna los datos del usuario (incluyendo null si no existe)
  return NextResponse.json(usuarios);
}
