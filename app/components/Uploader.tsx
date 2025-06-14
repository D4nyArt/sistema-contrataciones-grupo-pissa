/**
 * Uploader.tsx
 *
 * Proporciona un componente de carga de archivos integrado con Firebase Storage y Realtime Database.
 *
 * Este componente maneja el proceso completo de subida de archivos al sistema, incluyendo
 * validación de extensiones, renombrado automático de archivos, almacenamiento en Firebase
 * Cloud Storage y actualización de metadatos en Firebase Realtime Database. Soporta
 * configuración flexible de extensiones permitidas, callbacks post-subida y gestión
 * automática de estados de carga con feedback visual para el usuario.
 */

"use client";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, get, update, set } from "firebase/database";
import React, {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  ReactElement,
} from "react";
import { storage, database } from "@/firebaseConfig";
import { Upload } from "lucide-react";

/**
 * Define las propiedades del componente Uploader.
 */
interface UploaderProps {
  /** Carpeta de destino en Firebase Cloud Storage (ej: "expedientes/expediente123/documentos/doc456"). */
  storageUrl: string;

  /** Ruta equivalente en Firebase Realtime Database para almacenar metadatos. */
  dbPath: string;

  /** Nombre personalizado para el archivo (opcional). Si se proporciona, el archivo se renombrará. */
  filename?: string;

  /**
   * Extensión de archivo permitida (opcional).
   * Si no se especifica, se intenta leer desde ${dbPath}/extension en RTDB.
   * Si tampoco existe en BD, se usa "pdf" por defecto.
   */
  allowedExt?: string;

  /** Función callback opcional que se ejecuta tras completar la subida y actualizar RTDB. */
  onFileUploaded?: () => Promise<void> | void;
}

/**
 * Renderiza un componente de carga de archivos con integración completa de Firebase.
 *
 * Este componente proporciona una interfaz de usuario para subir archivos al sistema
 * con funcionalidades avanzadas de validación y procesamiento. Maneja automáticamente:
 * - Validación de extensiones de archivo según configuración
 * - Renombrado automático de archivos cuando se especifica
 * - Subida a Firebase Cloud Storage con gestión de errores
 * - Actualización de metadatos en Firebase Realtime Database
 * - Estados de carga con feedback visual y bloqueo durante proceso
 * - Limpieza automática del input para permitir re-subidas
 * - Callbacks personalizados post-procesamiento
 *
 * @param props - Las propiedades del componente.
 * @param props.storageUrl - Ruta de destino en Firebase Cloud Storage.
 * @param props.dbPath - Ruta en Firebase Realtime Database para metadatos.
 * @param props.filename - Nombre personalizado para el archivo (opcional).
 * @param props.allowedExt - Extensión permitida (opcional, por defecto desde DB o "pdf").
 * @param props.onFileUploaded - Callback ejecutado tras subida exitosa (opcional).
 * @returns El elemento JSX que renderiza el componente de carga de archivos.
 *
 * @example
 * ```tsx
 * // Uso básico para documentos PDF
 * <Uploader
 *   storageUrl="expedientes/user123/documentos"
 *   dbPath="expedientes/user123/documentos/ine"
 * />
 *
 * // Con extensión específica y renombrado
 * <Uploader
 *   storageUrl="contratos/user456"
 *   dbPath="contratos/user456/contrato_firmado"
 *   filename="contrato_firmado_2024"
 *   allowedExt="pdf"
 *   onFileUploaded={() => console.log("Contrato subido exitosamente")}
 * />
 *
 * // Para imágenes con callback
 * <Uploader
 *   storageUrl="fotos_perfil"
 *   dbPath="usuarios/user789/foto_perfil"
 *   filename="perfil"
 *   allowedExt="jpg"
 *   onFileUploaded={async () => {
 *     await updateUserProfile();
 *     showSuccessMessage();
 *   }}
 * />
 *
 * // En contexto de expediente de candidato
 * <div className="document-upload">
 *   <h3>Subir INE</h3>
 *   <Uploader
 *     storageUrl={`expedientes/${candidateId}/documentos`}
 *     dbPath={`expedientes/${candidateId}/documentos/ine`}
 *     onFileUploaded={refreshDocumentList}
 *   />
 * </div>
 * ```
 */
const Uploader: React.FC<UploaderProps> = ({
  storageUrl,
  dbPath,
  filename,
  allowedExt,
  onFileUploaded,
}): ReactElement => {
  /** Referencia al elemento input de archivo para control programático. */
  const inputRef = useRef<HTMLInputElement>(null);

  /** Estado que indica si hay una subida en progreso. */
  const [isUploading, setIsUploading] = useState(false);

  /** Estado que almacena la extensión de archivo permitida. */
  const [ext, setExt] = useState<string>("pdf"); // extensión por defecto

  useEffect(() => {
    /**
     * Determina la extensión de archivo permitida según la configuración.
     *
     * Esta función establece la extensión válida para el componente siguiendo
     * un orden de prioridad:
     * 1. Propiedad allowedExt si se proporciona
     * 2. Valor almacenado en Firebase Realtime Database en ${dbPath}/extension
     * 3. Valor por defecto "pdf" si no se encuentra configuración
     */
    async function fetchExt() {
      // a) La prop tiene prioridad
      if (allowedExt) {
        setExt(allowedExt.toLowerCase());
        return;
      }

      // b) De lo contrario intentamos leerla de RTDB
      try {
        const snap = await get(dbRef(database, `${dbPath}/extension`));
        if (snap.exists()) {
          setExt((snap.val() as string).toLowerCase());
        }
      } catch (err) {
        console.error("Error leyendo extensión permitida:", err);
      }
    }
    fetchExt();
  }, [dbPath, allowedExt]);

  /**
   * Maneja el proceso completo de subida de archivos y actualización de metadatos.
   *
   * Esta función ejecuta el flujo completo de procesamiento de archivos:
   * 1. Valida que se haya seleccionado un archivo
   * 2. Verifica que la extensión coincida con la permitida
   * 3. Renombra el archivo si se especifica un nombre personalizado
   * 4. Sube el archivo a Firebase Cloud Storage
   * 5. Actualiza o crea metadatos en Firebase Realtime Database
   * 6. Ejecuta callback opcional y limpia el input
   *
   * @param e - Evento de cambio del input de archivo.
   */
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    let file = inputRef.current?.files?.[0];
    if (!file) return;

    // a) Validar extensión
    const originalExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (originalExt !== ext) {
      alert(`Solo se permiten archivos .${ext}`);
      return;
    }

    // b) Renombrar si el padre envió la prop `filename`
    if (filename) {
      file = new File([file], `${filename}.${originalExt}`, {
        type: file.type,
        lastModified: file.lastModified,
      });
    }

    setIsUploading(true);
    try {
      // c) Subir a Cloud Storage
      const fileRef = storageRef(storage, `${storageUrl}/${file.name}`);
      await uploadBytes(fileRef, file);

      // d) Guardar/actualizar en RTDB
      const data = {
        url: `${storageUrl}/${file.name}`,
        estadoArchivo: "pendiente",
      };
      const docRef = dbRef(database, dbPath);
      const snap = await get(docRef);

      if (snap.exists()) {
        await update(docRef, data);
      } else {
        await set(docRef, data);
      }

      // e) Callback opcional
      if (onFileUploaded) setIsUploading(false);
      await onFileUploaded?.();
    } catch (err) {
      console.error("Error al subir archivo o actualizar BD:", err);
    } finally {
      setIsUploading(false);
      // Limpia el input para permitir volver a enviar el mismo archivo si se requiere
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label
        className={`cursor-pointer ${
          isUploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="bg-[#2d4583] hover:bg-[#08b177] text-white p-8 rounded-lg inline-block mb-2">
          <Upload size={32} />
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={`.${ext}`}
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>

      {isUploading && <p className="text-gray-500 mt-2">Subiendo archivo…</p>}
    </div>
  );
};

export default Uploader;
