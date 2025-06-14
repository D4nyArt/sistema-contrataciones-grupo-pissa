/**
 * getContracts/route.ts
 *
 * Proporciona funcionalidad para obtener todos los contratos disponibles en el sistema.
 *
 * Este módulo implementa un endpoint API para recuperar una lista consolidada
 * de todos los contratos registrados, incluyendo tanto contratos corporativos
 * como contratos de proyectos. Combina ambos tipos en una sola respuesta
 * para facilitar la gestión y visualización de contratos.
 */

import { NextResponse } from "next/server";
import { database } from "../../../firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Maneja las peticiones GET para obtener todos los contratos disponibles.
 *
 * Recupera y combina todos los contratos almacenados en las colecciones
 * de contratos corporativos y contratos de proyectos. Transforma los datos
 * de Firebase en un formato consistente que incluye el ID del contrato
 * junto con todas sus propiedades.
 *
 * Proceso de recuperación:
 * 1. Obtiene contratos corporativos de "contratos/corporativo"
 * 2. Obtiene contratos de proyectos de "contratos/proyectos"
 * 3. Combina ambas listas en una sola respuesta
 * 4. Transforma cada contrato para incluir su ID como propiedad
 *
 * @returns Una respuesta NextResponse con array de todos los contratos disponibles
 * @throws Retorna array vacío si no existen contratos en alguna categoría
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 *  GET /api/getContracts
 * // Retorna:
 *  [
 *    { id: "concorp001", name: "Contrato Base", url: "https://...", tipo: "corporativo" },
 *    { id: "conproy001", name: "Contrato Proyecto X", url: "https://...", tipo: "proyecto" },
 *    { id: "conproy002", name: "Contrato Proyecto Y", url: "https://...", tipo: "proyecto" }
 *  ]
 * ```
 */
export async function GET() {
  try {
    const snapshot = await get(ref(database, "contratos/clientes"));
    if (!snapshot.exists()) return NextResponse.json([], { status: 200 });


      const dataValue = snapshot.val();
      const usersArray = Object.entries(dataValue).map(([id, value]) => ({
        id,
        ...(value as Record<string, unknown>),
      }));
    

    const snapshot2 = await get(ref(database, "contratos/empresas"));
    
    if (!snapshot.exists()) return NextResponse.json([], { status: 200 });

    const dataValue2 = snapshot2.val();
    const usersArray2 = Object.entries(dataValue2).map(([id, value]) => ({
      id,
      ...(value as Record<string, unknown>),
    }));

    // 3. Combinar ambas listas de contratos
    const usersArray_final = usersArray.concat(usersArray2);

    return NextResponse.json(usersArray_final, { status: 200 });
  } catch (error: unknown) {
    console.error("Error al obtener contratos:", error);
    return NextResponse.json(
      { error: "Error fetching contracts" },
      { status: 500 }
    );
  }
}
