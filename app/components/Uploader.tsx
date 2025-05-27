"use client";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, get, update, set } from "firebase/database";
import React, { useRef, useState, useEffect } from "react";
import { storage, database } from "@/firebaseConfig";
import { Upload } from "lucide-react";

interface UploaderProps {
  storageUrl: string;  // ej. "expedientes/expediente123/documentos/doc456"
  dbPath: string;      // misma ruta en RTDB sin "/extension"
  contrato?: boolean;
  onFileUploaded: () => void;
}

export default function Uploader({
  onFileUploaded,
  storageUrl,
  dbPath,
  contrato = false,
}: UploaderProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [allowedExt, setAllowedExt] = useState<string>("pdf");

  // 1) Leemos la extensión permitida de la BD
  useEffect(() => {
    async function fetchAllowedExt() {
      try {
        const extSnap = await get(dbRef(database, `${dbPath}/extension`));
        if (extSnap.exists()) {
          setAllowedExt((extSnap.val() as string).toLowerCase());
        }
      } catch (err) {
        console.error("Error leyendo extensión:", err);
      }
    }
    fetchAllowedExt();
  }, [dbPath]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    const nameLower = file.name.toLowerCase();
    // 2) Validamos extensión
    if (!nameLower.endsWith(`.${allowedExt}`)) {
      alert(`Solo se permiten archivos .${allowedExt} en este apartado`);
      return;
    }

    setIsUploading(true);
    try {
      const fileRef = storageRef(storage, `${storageUrl}/${file.name}`);
      await uploadBytes(fileRef, file);
      const docRef = dbRef(database, dbPath);
      await get(docRef).then(snap => {
        const data = { url: `${storageUrl}/${file.name}`, estadoArchivo: "pendiente" };
        return snap.exists() ? update(dbRef(database, dbPath), data)
                             : set(dbRef(database, dbPath), data);
      });
      onFileUploaded();
    } catch (err) {
      console.error("Error al subir o actualizar BD:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className={`cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="bg-[#2d4583] hover:bg-[#08b177] text-white p-8 rounded-lg inline-block mb-2">
          <Upload size={32} />
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={`.${allowedExt}`}
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
      {isUploading && <p className="text-gray-500 mt-2">Subiendo archivo…</p>}
    </div>
  );
}