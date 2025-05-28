"use client";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, get, set, update } from "firebase/database";
import React, {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  ReactElement,
} from "react";
import { storage, database } from "@/firebaseConfig";
import { Upload } from "lucide-react";

/* ----------------------------------------------------------
 *  PROPS
 * -------------------------------------------------------- */
interface UploaderProps {
  /** Carpeta en Cloud Storage.  
   *  Ej.: "expedientes/expediente123/documentos/doc456"  */
  storageUrl: string;

  /** Ruta equivalente en Realtime DB. */
  dbPath: string;

  /** Si se indica, el archivo se renombrará a `${filename}.${extOriginal}` */
  filename?: string;

  /** 
   *  Extensión permitida.  
   *  - Si no se pasa, se intenta leer **${dbPath}/extension** en RTDB.  
   *  - Si tampoco existe en BD, se usa "pdf".
   */
  allowedExt?: string;

  /** Callback opcional que se dispara tras completar la subida y actualizar RTDB */
  onFileUploaded?: () => Promise<void> | void;
}

/* ----------------------------------------------------------
 *  COMPONENTE
 * -------------------------------------------------------- */
const Uploader: React.FC<UploaderProps> = ({
  storageUrl,
  dbPath,
  filename,
  allowedExt,
  onFileUploaded,
}): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ext, setExt] = useState<string>("pdf"); // extensión por defecto

  /* ----------------------------------
   * 1) Averiguamos la extensión válida
   * ---------------------------------*/
  useEffect(() => {
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

  /* ----------------------------------
   * 2) Subida + actualización en RTDB
   * ---------------------------------*/
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
      snap.exists() ? await update(docRef, data) : await set(docRef, data);

      // e) Callback opcional
      await onFileUploaded?.();
    } catch (err) {
      console.error("Error al subir archivo o actualizar BD:", err);
    } finally {
      setIsUploading(false);
      // Limpia el input para permitir volver a enviar el mismo archivo si se requiere
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  /* ----------------------------------------------------------
   * 3) UI
   * -------------------------------------------------------- */
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

      {isUploading && (
        <p className="text-gray-500 mt-2">Subiendo archivo…</p>
      )}
    </div>
  );
};

export default Uploader;
