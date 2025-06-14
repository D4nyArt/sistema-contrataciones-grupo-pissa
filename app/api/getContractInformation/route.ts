/**
 * getContractInformation/route.ts
 *
 * Proporciona funcionalidad para obtener información completa de contratos de usuarios.
 *
 * Este módulo implementa un endpoint API para recuperar toda la información
 * relevante sobre contratos activos de usuarios, incluyendo metadatos del contrato,
 * estado de activación, duración, notas y enlaces de descarga. Maneja diferentes
 * tipos de contratos (proyectos y corporativos) con rutas específicas.
 */

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/firebaseConfig";
import { ref, get } from "firebase/database";

/**
 * Interfaz que define la estructura de información de un contrato.
 */
interface InformacionContrato {
  /** Nombre del archivo del contrato */
  name?: string;
  /** URL de descarga del contrato */
  url?: string;
}

/**
 * Interfaz que define la estructura de datos de contrato del usuario.
 */
interface DatosContrato {
  /** ID único del contrato */
  id: string;
  /** Estado del contrato activo: true/false */
  contrato_activo: boolean;
  /** Estado del contrato: 'activo' | 'inactivo' | 'pendiente' | 'vencido' */
  estado: string;
  /** Duración del contrato en días/meses/años */
  duracion: string;
  /** Notas adicionales sobre el contrato */
  notas: string;
}

/**
 * Interfaz que define la estructura de respuesta del endpoint.
 */
interface RespuestaContrato {
  /** Rol del usuario en el sistema */
  role: string | null;
  /** Estado actual del contrato */
  state: string | null;
  /** Duración del contrato */
  duration: string | null;
  /** Indica si el contrato está activo */
  active_contract: boolean | null;
  /** Notas del contrato */
  notes: string | null;
  /** Información completa del contrato */
  contract: {
    /** ID del contrato */
    id: string;
    /** Nombre del archivo con extensión */
    name: string;
    /** URL de descarga */
    url: string;
    /** Carpeta donde se almacena el contrato */
    folder: string;
  } | null;
}

/**
 * Maneja las peticiones GET para obtener información completa de contratos.
 *
 * Recupera toda la información relevante sobre el contrato activo de un usuario,
 * incluyendo metadatos, estado, duración y enlaces de descarga. Determina
 * automáticamente el tipo de contrato (proyecto o corporativo) basado en el
 * prefijo del ID del contrato para construir las rutas correctas.
 *
 * Tipos de contratos soportados:
 * - Contratos de proyecto: ID comienza con "conproy"
 * - Contratos corporativos: ID comienza con "concorp"
 *
 * @param request - El objeto NextRequest con uid como query parameter
 * @returns Una respuesta NextResponse con información completa del contrato
 * @throws Retorna error 400 si no se proporciona uid
 * @throws Retorna error 404 si no existe información de contrato para el usuario
 * @throws Retorna error 500 si hay problemas de conexión con la base de datos
 *
 * @example
 * ```ts
 * // GET /api/getContractInformation?uid=123
 * // Retorna información completa del contrato activo del usuario 123
 * // {
 * //   "role": "candidato",
 * //   "state": "activo",
 * //   "duration": "12 meses",
 * //   "active_contract": true,
 * //   "notes": "Contrato temporal",
 * //   "contract": {
 * //     "id": "conproy001",
 * //     "name": "contrato_proyecto.pdf",
 * //     "url": "https://storage.../contrato.pdf",
 * //     "folder": "pruebaInicial/contratos/proyectos"
 * //   }
 * // }
 * ```
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  // Validación de parámetros requeridos
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    // 1. Obtener rol del usuario desde la base de datos
    const roleSnap = await get(ref(database, `usuarios/${uid}/rol`));
    const role = roleSnap.exists() ? roleSnap.val() : null;

    // 2. Obtener información del contrato activo del usuario
    const recSnap = await get(
      ref(database, `expedientes/expediente${uid}/contratos`)
    );
    if (!recSnap.exists()) {
      // Retorna estructura básica si no existe contrato
      return NextResponse.json(
        {
          role,
          contract: null,
          state: null,
          duration: null,
          notes: null,
        },
        { status: 404 }
      );
    }

    // Extrae los datos del contrato
    const {
      id: contractId,
      contrato_activo: active_contract,
      estado: state,
      duracion: duration,
      notas: notes,
    } = recSnap.val() as DatosContrato;

    // Determinar la carpeta y la ruta de datos según el ID del contrato
    const folder = "pruebaInicial/expedientes/expediente" + uid + "/contratos/preview";
    const dataPath = "expedientes/expediente" + uid + "/contratos/preview/url";

    // 4. Obtener información detallada del contrato (nombre y URL)
    const infoSnap = await get(ref(database, dataPath));
    const info: InformacionContrato = infoSnap.exists()
      ? infoSnap.val()
      : { name: null, url: null };

    // 5. Construir y retornar la respuesta completa
    const response: RespuestaContrato = {
      role,
      state,
      duration,
      active_contract,
      notes,
      contract: {
        id: contractId,
        name: info.name + ".pdf",
        url: info.url || "",
        folder,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error al obtener información del contrato:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
