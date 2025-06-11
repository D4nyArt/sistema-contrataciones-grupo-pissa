/**
 * expediente/route.ts
 *
 * Proporciona funcionalidad para gestionar expedientes de candidatos.
 *
 * Este módulo implementa endpoints API para obtener y crear expedientes
 * de candidatos con una estructura predefinida de documentos requeridos
 * para el proceso de contratación.
 */

import { NextRequest, NextResponse } from "next/server";
import { ref, get, set } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Interfaz que define la estructura de un campo de documento.
 */
interface CampoDocumento {
  /** Nombre descriptivo del campo */
  nombre: string;
  /** Valor actual del campo */
  valor: string;
  /** Estado del campo: 'no_subido' | 'subido' | 'aprobado' | 'rechazado' */
  estado: string;
}

/**
 * Interfaz que define la estructura de un documento del expediente.
 */
interface DocumentoExpediente {
  /** Campos específicos que debe contener el documento */
  campos: Record<string, CampoDocumento>;
  /** Estado del archivo: 'no_subido' | 'subido' | 'aprobado' | 'rechazado' */
  estadoArchivo: string;
  /** Estado de los campos: 'no_subido' | 'completo' | 'incompleto' */
  estadoCampos: string;
  /** Estado general del documento: 'no_subido' | 'completo' | 'incompleto' */
  estadoGeneral: string;
  /** Nombre descriptivo del documento */
  nombre: string;
  /** URL del archivo subido */
  url: string;
  /** Extensión permitida para el archivo */
  extension: string;
}

/**
 * Interfaz que define la estructura completa de un expediente.
 */
interface EstructuraExpediente {
  /** ID del candidato propietario del expediente */
  id_candidato: string;
  /** Notas adicionales sobre el expediente */
  notas: string;
  /** Indica si el expediente está completo */
  expediente_completo: boolean;
  /** Colección de documentos del expediente */
  documentos: Record<string, DocumentoExpediente>;
}

/**
 * Maneja las peticiones GET para obtener un expediente específico.
 *
 * Busca y retorna la información completa de un expediente basado en el ID
 * del candidato proporcionado como parámetro de consulta.
 *
 * @param request - El objeto NextRequest que contiene el expedienteId como query parameter
 * @returns Una respuesta NextResponse con los datos del expediente o un error
 * @throws Retorna error 400 si no se proporciona expedienteId
 * @throws Retorna error 404 si el expediente no existe
 *
 * @example
 * ```ts
 * // GET /api/expediente?expedienteId=123
 * // Retorna los datos completos del expediente del candidato 123
 * ```
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const expedienteId = searchParams.get("expedienteId");

  // Validación de parámetros requeridos
  if (!expedienteId) {
    return NextResponse.json(
      { error: "Se requiere expedienteId" },
      { status: 400 }
    );
  }

  // Construye la ruta en la base de datos y obtiene los datos
  const path = `expedientes/expediente${expedienteId}`;
  const nodeRef = ref(database, path);
  const snap = await get(nodeRef);

  // Verifica si el expediente existe
  if (!snap.exists()) {
    return NextResponse.json(
      { error: "Expediente no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(snap.val());
}

/**
 * Maneja las peticiones POST para crear o inicializar un expediente.
 *
 * Crea un nuevo expediente con una estructura predefinida de documentos
 * si no existe. Si ya existe, simplemente confirma la operación.
 * La estructura incluye todos los documentos requeridos para el proceso
 * de contratación como INE, CURP, comprobantes, etc.
 *
 * @param request - El objeto NextRequest que contiene el expedienteId en el body
 * @returns Una respuesta NextResponse confirmando la creación/existencia del expediente
 * @throws Retorna error 400 si no se proporciona expedienteId
 *
 * @example
 * ```ts
 * // POST /api/expediente
 * // Body: { "expedienteId": "123" }
 * // Crea la estructura inicial del expediente para el candidato 123
 * ```
 */
export async function POST(request: NextRequest) {
  const { expedienteId } = await request.json();

  // Validación de parámetros requeridos
  if (!expedienteId) {
    return NextResponse.json(
      { error: "Se requiere expedienteId" },
      { status: 400 }
    );
  }

  // Construye la ruta en la base de datos y verifica existencia
  const path = `expedientes/expediente${expedienteId}`;
  const nodeRef = ref(database, path);
  const snap = await get(nodeRef);

  // Si no existe, crea la estructura predefinida del expediente
  if (!snap.exists()) {
    const defaultStructure: EstructuraExpediente = {
      id_candidato: expedienteId,
      notas: "",
      expediente_completo: false,
      documentos: {
        // Documento de identificación oficial
        INE: {
          campos: {
            nombreCompleto: {
              nombre: "Nombre Completo",
              valor: "",
              estado: "no_subido",
            },
          },
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "INE",
          url: "",
          extension: "jpg",
        },
        // Clave Única de Registro de Población
        CURP: {
          campos: {
            curp: {
              nombre: "CURP",
              valor: "",
              estado: "no_subido",
            },
          },
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "CURP",
          url: "",
          extension: "pdf",
        },
        // Documento de nacimiento oficial
        ActaNacimiento: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Acta de Nacimiento",
          url: "",
          extension: "jpg",
        },
        // Constancia fiscal del SAT
        ConstanciaSituacionFiscal: {
          campos: {
            rfc: {
              nombre: "RFC",
              valor: "",
              estado: "no_subido",
            },
          },
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Constancia de Situación Fiscal",
          url: "",
          extension: "pdf",
        },
        // Comprobante de residencia
        ComprobanteDomicilio: {
          campos: {
            domicilio: {
              nombre: "Domicilio",
              valor: "",
              estado: "no_subido",
            },
          },
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Comprobante de Domicilio",
          url: "",
          extension: "jpg",
        },
        // Número de afiliación al IMSS
        NumeroImss: {
          campos: {
            numeroImss: {
              nombre: "Número de IMSS",
              valor: "",
              estado: "no_subido",
            },
          },
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Número de IMSS",
          url: "",
          extension: "pdf",
        },
        // Documentos académicos
        ComprobanteEstudios: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Comprobante de Estudios",
          url: "",
          extension: "jpg",
        },
        // Referencias laborales
        ConstanciaLaboral1: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Constancia Laboral 1",
          url: "",
          extension: "jpg",
        },
        ConstanciaLaboral2: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Constancia Laboral 2",
          url: "",
          extension: "jpg",
        },
        // Referencias personales
        CartaRecomendacion1: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Carta de Recomendación Personal 1",
          url: "",
          extension: "jpg",
        },
        CartaRecomendacion2: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Carta de Recomendación Personal 2",
          url: "",
          extension: "jpg",
        },
        // Documentos de vivienda
        RetencionInfonavit: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Hoja de Retención Infonavit",
          url: "",
          extension: "jpg",
        },
        // Información bancaria para nómina
        DepositoNomina: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Estado de Cuenta para Depósito de Nómina",
          url: "",
          extension: "pdf",
        },
        // Currículum vitae
        CV: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Currículum",
          url: "",
          extension: "pdf",
        },
        // Documentos médicos
        CertificadoMedico: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Certificado Médico",
          url: "",
          extension: "jpg",
        },
        // Antecedentes penales
        CertificadoAntecedentes: {
          campos: {},
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Certificado de Antecedentes No Penales",
          url: "",
          extension: "pdf",
        },
        // Estado de cuenta bancario
        EstadoCuenta: {
          campos: {
            clabe: {
              nombre: "CLABE Interbancaria",
              valor: "",
              estado: "no_subido",
            },
            cuenta: {
              nombre: "Número de Cuenta",
              valor: "",
              estado: "no_subido",
            },
          },
          estadoArchivo: "no_subido",
          estadoCampos: "no_subido",
          estadoGeneral: "no_subido",
          nombre: "Estado de Cuenta o Contrato Bancario",
          url: "",
          extension: "pdf",
        },
      },
    };

    // Guarda la estructura predefinida en la base de datos
    await set(nodeRef, defaultStructure);
  }

  return NextResponse.json({ ok: true });
}
