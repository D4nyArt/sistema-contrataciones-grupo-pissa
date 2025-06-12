/**
 * downloadBatchFilesButton.tsx
 *
 * Proporciona un botón para descargar todos los documentos de un expediente en un archivo ZIP.
 *
 * Este componente permite al personal de RH y administradores descargar masivamente todos
 * los archivos de un expediente específico, empaquetándolos automáticamente en un archivo
 * ZIP. Utiliza JSZip para la compresión y Firebase Storage para obtener los archivos,
 * proporcionando una forma eficiente de gestionar documentos de candidatos.
 */

import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";
import { FolderDown } from "lucide-react";

/**
 * Define la estructura de datos de un documento dentro del expediente.
 */
type Documento = {
  /** El estado de aprobación del archivo del documento. */
  estadoArchivo: string;

  /** El estado de aprobación de los campos de datos del documento. */
  estadoCampos: string;

  /** El estado general calculado del documento. */
  estadoGeneral: string;

  /** La extensión del archivo (pdf, jpg, png, etc.). */
  extension: string;

  /** El nombre descriptivo del documento. */
  nombre: string;

  /** La ruta del archivo en Firebase Storage. */
  url: string;
};

/**
 * Define la estructura de datos de un expediente completo.
 */
type Expediente = {
  /** Diccionario de documentos indexados por su ID. */
  documentos: Record<string, Documento>;

  /** El ID del candidato propietario del expediente. */
  id_candidato: string;

  /** Notas adicionales del expediente (opcional). */
  notas?: string;
};

/**
 * Define las propiedades del componente DownloadBatchFilesButton.
 */
interface Props {
  /** El ID del expediente del cual descargar todos los archivos. */
  expedienteId: string;
}

/**
 * Renderiza un botón para descargar masivamente todos los documentos de un expediente.
 *
 * Este componente obtiene automáticamente la información del expediente, recopila todos
 * los archivos disponibles desde Firebase Storage, los empaqueta en un archivo ZIP y
 * permite al usuario descargar el conjunto completo. Incluye indicadores de progreso
 * y manejo de errores para archivos individuales sin interrumpir el proceso global.
 *
 * @param props - Las propiedades del componente.
 * @param props.expedienteId - El ID del expediente del cual descargar archivos.
 * @returns El elemento JSX que renderiza el botón de descarga masiva.
 *
 * @example
 * ```tsx
 * // Botón para descargar expediente completo
 * <DownloadBatchFilesButton expedienteId="user123" />
 *
 * // En una lista de expedientes
 * {expedientes.map(exp => (
 *   <div key={exp.id}>
 *     <span>{exp.candidato}</span>
 *     <DownloadBatchFilesButton expedienteId={exp.id} />
 *   </div>
 * ))}
 * ```
 */
const DownloadBatchFilesButton: React.FC<Props> = ({ expedienteId }) => {
  /** Estado que almacena la información completa del expediente. */
  const [expediente, setExpediente] = useState<Expediente | null>(null);

  /** Estado que indica si está en proceso la descarga masiva. */
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /**
     * Obtiene la información completa del expediente desde la API.
     *
     * Esta función consulta la API para recuperar todos los datos del expediente,
     * incluyendo la lista de documentos y sus rutas en Firebase Storage.
     */
    async function fetchExpediente() {
      try {
        const res = await fetch(`/api/expediente?expedienteId=${expedienteId}`);
        if (res.ok) {
          const data: Expediente = await res.json();
          setExpediente(data);
        } else {
          console.error("Error al cargar expediente", await res.text());
        }
      } catch (err) {
        console.error("Error cargando expediente:", err);
      }
    }
    fetchExpediente();
  }, [expedienteId]);

  /**
   * Maneja el proceso de descarga masiva de todos los archivos del expediente.
   *
   * Esta función itera sobre todos los documentos del expediente, descarga cada
   * archivo desde Firebase Storage, los empaqueta en un archivo ZIP y permite
   * al usuario descargar el conjunto completo. Maneja errores individuales sin
   * interrumpir el proceso global.
   */
  const handleDownload = async () => {
    if (!expediente) return;
    setLoading(true);
    const zip = new JSZip();
    const storage = getStorage();

    // Procesar cada documento del expediente
    for (const key of Object.keys(expediente.documentos)) {
      const doc = expediente.documentos[key];
      if (!doc.url) continue;

      try {
        // Obtener URL de descarga desde Firebase Storage
        const fileRef = storageRef(storage, doc.url);
        const downloadUrl = await getDownloadURL(fileRef);

        // Descargar el archivo como blob
        const res = await fetch(downloadUrl);
        const blob = await res.blob();

        // Agregar al ZIP con nombre descriptivo
        const filename = `${doc.nombre}.${doc.extension}`;
        zip.file(filename, blob);
      } catch (err) {
        console.error(`Error descargando ${key}:`, err);
        // Continúa con el siguiente archivo en caso de error
      }
    }

    try {
      // Generar el archivo ZIP y comenzar descarga
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `expediente-${expediente.id_candidato}.zip`);
    } catch (err) {
      console.error("Error generando ZIP:", err);
    } finally {
      setLoading(false);
    }
  };

  // Estado de carga inicial
  if (!expediente) {
    return (
      <button
        className="px-3.5 py-2 text-xs text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled
      >
        Cargando expediente…
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-3.5 py-2 bg-[#2d4583] text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-100 hover:text-[#2d4583] transition-colors cursor-pointer"
      title="Descargar todos los documentos del expediente en ZIP"
    >
      {loading ? "Preparando descarga…" : <FolderDown className="w-5" />}
    </button>
  );
};

export default DownloadBatchFilesButton;
