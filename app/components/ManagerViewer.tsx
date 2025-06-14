/**
 * ManagerViewer.tsx
 *
 * Proporciona un visor y gestor de archivos para documentos almacenados en Firebase Storage.
 *
 * Este componente permite visualizar archivos (PDFs e imágenes) desde Firebase Storage
 * y gestionar su eliminación según el rol del usuario. Obtiene las rutas de archivos
 * desde Firebase Realtime Database, proporciona vista previa en modal y permite
 * eliminación completa (tanto de Storage como de la referencia en la base de datos)
 * para usuarios con permisos apropiados.
 */

import React, { useState, useEffect } from "react";
import { Eye, Trash } from "lucide-react";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { ref as dbRef, update, get } from "firebase/database";
import { storage, database } from "@/firebaseConfig";
import PdfModal from "@/app/components/FileModal";

/**
 * Define las propiedades del componente ManagerViewer.
 */
interface ManagerViewerProps {
  /** La ruta en Firebase Realtime Database donde se almacena la referencia al archivo. */
  dbPath: string;

  /** Callback opcional que se ejecuta cuando un archivo es eliminado exitosamente. */
  onFileDeleted?: () => void;

  /** El rol del usuario que determina los permisos de eliminación (por defecto "candidato"). */
  userRole?: string;
}

/**
 * Renderiza un visor y gestor de archivos con capacidades de visualización y eliminación.
 *
 * Este componente maneja la visualización y gestión de archivos almacenados en Firebase
 * Storage. Obtiene automáticamente las referencias de archivos desde Firebase Realtime
 * Database, proporciona una interfaz para visualizar archivos en un modal y permite
 * la eliminación completa de archivos (tanto del Storage como de las referencias en
 * la base de datos) para usuarios con los permisos apropiados.
 *
 * @param props - Las propiedades del componente.
 * @param props.dbPath - Ruta en Database donde se almacena la referencia del archivo.
 * @param props.onFileDeleted - Callback ejecutado tras eliminación exitosa (opcional).
 * @param props.userRole - Rol del usuario para control de permisos (por defecto "candidato").
 * @returns El elemento JSX que renderiza el visor y gestor de archivos.
 *
 * @example
 * ```tsx
 * // Visor para documento de expediente
 * <ManagerViewer
 *   dbPath="expedientes/user123/documentos/diploma"
 *   onFileDeleted={() => console.log("Archivo eliminado")}
 *   userRole="candidato"
 * />
 *
 * // Visor para usuario de RH (sin opción de eliminar)
 * <ManagerViewer
 *   dbPath="expedientes/user123/documentos/diploma"
 *   userRole="rh"
 * />
 *
 * // En lista de documentos
 * {documentos.map(doc => (
 *   <ManagerViewer
 *     key={doc.id}
 *     dbPath={`expedientes/${userId}/documentos/${doc.id}`}
 *     onFileDeleted={handleDocumentDeleted}
 *     userRole={currentUserRole}
 *   />
 * ))}
 * ```
 *
 * @see {@link PdfModal} - Componente modal para visualizar archivos PDF e imágenes
 */
export default function ManagerViewer({
  dbPath,
  onFileDeleted,
  userRole = "candidato",
}: ManagerViewerProps) {
  /** Estado que controla la visibilidad del modal de visualización. */
  const [showPdf, setShowPdf] = useState(false);

  /** Estado que almacena la URL/ruta del archivo a visualizar. */
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  /** Estado que almacena la ruta completa del archivo en Firebase Storage. */
  const [filePath, setFilePath] = useState<string>("");

  /** Estado que indica si hay un proceso de carga en curso. */
  const [loading, setLoading] = useState(false);

  /** Estado que almacena mensajes de error. */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbPath) return;

    /**
     * Obtiene la referencia del archivo desde Firebase Realtime Database.
     *
     * Esta función consulta la base de datos para obtener la ruta del archivo
     * almacenada en el campo 'url' de la ruta especificada. Maneja casos donde
     * no existe referencia al archivo y actualiza los estados correspondientes.
     */
    const fetchPdfUrl = async () => {
      try {
        setLoading(true);
        // Leer de RTDB el valor guardado en "dbPath/url"
        const snap = await get(dbRef(database, `${dbPath}/url`));
        if (!snap.exists()) {
          setError("No existe referencia al archivo");
          return;
        }
        const pathInStorage = snap.val() as string;
        setFilePath(pathInStorage);

        if (!pathInStorage) {
          setError("Archivo no disponible");
          return;
        }

        // Establecer la ruta para uso posterior en el modal
        setPdfUrl(pathInStorage);
      } catch (err) {
        console.error("Error al obtener URL de descarga:", err);
        setError("No se pudo cargar el PDF");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();
  }, [dbPath]);

  /**
   * Maneja la apertura del modal de visualización del archivo.
   *
   * Verifica que el archivo esté disponible antes de abrir el modal,
   * proporcionando feedback al usuario si el archivo aún no ha cargado.
   */
  const handleView = () => {
    if (pdfUrl) setShowPdf(true);
    else alert("Espera a que el documento termine de cargar");
  };

  /**
   * Maneja el cierre del modal de visualización.
   */
  const handleCloseModal = () => setShowPdf(false);

  /**
   * Maneja la eliminación completa del archivo.
   *
   * Esta función ejecuta un proceso de eliminación en dos pasos:
   * 1. Elimina el archivo físico de Firebase Storage
   * 2. Limpia las referencias en Firebase Realtime Database
   * 3. Actualiza el estado del documento a "no_subido"
   * 4. Ejecuta el callback de eliminación si está disponible
   */
  const handleDeleteFile = async () => {
    try {
      // Borrar de Storage usando filePath
      const fileReference = storageRef(storage, filePath);
      await deleteObject(fileReference);

      // Limpiar RTDB en dbPath/url y estadoArchivo
      const docRef = dbRef(database, dbPath);
      await update(docRef, {
        url: "",
        estadoArchivo: "no_subido",
      });

      onFileDeleted?.();
    } catch (err) {
      console.error("Error al eliminar el archivo:", err);
      alert("Ocurrió un error al eliminar el archivo");
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Botón de visualización */}
      <button
        onClick={handleView}
        className="bg-blue-900 text-white p-4 rounded-lg cursor-pointer"
        disabled={loading || !!error}
        title="Ver archivo"
      >
        <Eye size={32} />
      </button>

      {/* Nombre del archivo truncado */}
      <span className="max-w-xs truncate" title={filePath.split("/").pop()}>
        {filePath.split("/").pop()}
      </span>

      {/* Botón de eliminación (solo para candidatos) */}
      {userRole === "candidato" && (
        <button
          onClick={handleDeleteFile}
          className="text-red-500 hover:text-red-700"
          disabled={loading}
          title="Eliminar archivo"
        >
          <Trash size={24} />
        </button>
      )}

      {/* Indicadores de estado */}
      {loading && <span className="text-gray-500 text-sm">Cargando...</span>}
      {error && <span className="text-red-500 text-sm">{error}</span>}

      {/* Modal de visualización */}
      {showPdf && pdfUrl && (
        <PdfModal pdfUrl={pdfUrl} onClose={handleCloseModal} />
      )}
    </div>
  );
}
