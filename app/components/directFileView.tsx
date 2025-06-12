/**
 * directFileView.tsx
 *
 * Proporciona un visor de archivos directo para documentos almacenados en Firebase Storage.
 *
 * Este componente permite visualizar archivos PDF directamente desde el almacenamiento en la nube
 * sin necesidad de descargarlos. Construye rutas dinámicas basadas en el contexto (expedientes,
 * contratos, documentos específicos) y roles de usuario, proporcionando acceso seguro y eficiente
 * a los documentos del sistema.
 */

import { useEffect, useState } from "react";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { storage } from "@/firebaseConfig";

/**
 * Define las propiedades del componente DirectViewer.
 */
interface DirectViewerProps {
  /** El ID del expediente al que pertenece el archivo (opcional). */
  expedienteId?: string;

  /** El ID del documento específico dentro del expediente (opcional). */
  documentoId?: string;

  /** El nombre del archivo a visualizar. */
  fileName: string;

  /** La carpeta base en Firebase Storage (por defecto "pruebaInicial"). */
  folder?: string;

  /** El rol del usuario actual (por defecto "candidato"). */
  userRole?: string;

  /** Indica si el archivo es un contrato (cambia la lógica de construcción de ruta). */
  contrato?: boolean;
}

/**
 * Renderiza un visor de archivos PDF directo desde Firebase Storage.
 *
 * Este componente construye dinámicamente la ruta del archivo basándose en el contexto
 * y tipo de documento, obtiene la URL de descarga desde Firebase Storage y presenta
 * el contenido en un iframe integrado. Maneja diferentes tipos de documentos como
 * expedientes, contratos y archivos generales con lógica de rutas diferenciada por rol.
 *
 * @param props - Las propiedades del componente.
 * @param props.expedienteId - ID del expediente contenedor (opcional).
 * @param props.documentoId - ID del documento específico (opcional).
 * @param props.fileName - Nombre del archivo a mostrar.
 * @param props.folder - Carpeta base en Storage (por defecto "pruebaInicial").
 * @param props.userRole - Rol del usuario actual (por defecto "candidato").
 * @param props.contrato - Si el archivo es un contrato (por defecto false).
 * @returns El elemento JSX que renderiza el visor de archivos.
 *
 * @example
 * ```tsx
 * // Visor para documento de expediente
 * <DirectViewer
 *   expedienteId="user123"
 *   documentoId="cedula"
 *   fileName="cedula.pdf"
 *   userRole="rh"
 * />
 *
 * // Visor para contrato de candidato
 * <DirectViewer
 *   expedienteId="user123"
 *   fileName="contrato.pdf"
 *   userRole="candidato"
 *   contrato={true}
 * />
 *
 * // Visor para archivo general
 * <DirectViewer
 *   fileName="manual.pdf"
 *   folder="documentos"
 * />
 * ```
 */
export default function DirectViewer({
  expedienteId,
  documentoId,
  fileName,
  folder = "pruebaInicial",
  userRole = "candidato",
  contrato,
}: DirectViewerProps) {
  /** Estado que almacena la URL del PDF obtenida desde Firebase Storage. */
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

  /**
   * Construye la ruta completa del archivo basándose en el contexto y tipo.
   *
   * La lógica de construcción de ruta varía según:
   * - Si es un contrato: diferente estructura para candidatos vs otros roles
   * - Si es documento de expediente: incluye expedienteId y documentoId
   * - Si es archivo general: solo usa la carpeta base y nombre
   */
  let filePath = "";
  if (contrato) {
    if (userRole === "candidato") {
      filePath = `${folder}/${fileName}`;
    } else {
      filePath = `${folder}/${expedienteId}/Contratos/${fileName}`;
    }
  } else {
    filePath =
      expedienteId && documentoId
        ? `${folder}/${expedienteId}/${documentoId}/${fileName}`
        : `${folder}/${fileName}`;
  }

  useEffect(() => {
    /**
     * Obtiene la URL de descarga del archivo desde Firebase Storage.
     *
     * Esta función asíncrona consulta Firebase Storage usando la ruta
     * construida y establece la URL en el estado para su visualización.
     */
    const fetchPdfUrl = async (): Promise<void> => {
      try {
        const url = await getDownloadURL(storageRef(storage, filePath));
        setPdfUrl(url);
      } catch (err) {
        console.error("Error al obtener URL de descarga:", err);
      }
    };

    fetchPdfUrl();
  }, [filePath]);

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-[50vh] md:h-full rounded-xl shadow-md"
      allowFullScreen
      title={`Visor de archivo: ${fileName}`}
    />
  );
}
