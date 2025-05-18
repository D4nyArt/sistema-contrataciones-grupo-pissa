"use client";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, update, get } from "firebase/database";
import React, { useRef, useState } from "react";
import { storage, database } from "@/firebaseConfig";
import { Upload } from "lucide-react";

// Definimos las props que puede recibir Uploader
interface UploaderProps {
  storageUrl: string;
  dbPath: string;
  onFileUploaded: () => void;
}

const Uploader: React.FC<UploaderProps> = ({
  onFileUploaded,
  storageUrl,
  dbPath,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    console.log("Archivo seleccionado:", file);
    setIsUploading(true);

    try {
      // 1. Determinar la ruta del archivo
      const fileReference = storageRef(storage, `${storageUrl}/${file.name}`);
      const snapshot = await uploadBytes(fileReference, file);
      console.log("Archivo subido correctamente:", snapshot);
      try {
        // Obtener la URL de descarga una sola vez
        //const downloadUrl = await getDownloadURL(fileReference);

        // Verificar si existe la ruta en la BD
        const docRef = dbRef(database, dbPath);
        const docSnapshot = await get(docRef);

        if (docSnapshot.exists()) {
          // Actualizar documento existente
          await update(docRef, {
            url: storageUrl + "/" + file.name, // Guardar la URL general, no la de descarga
            estadoArchivo: "pendiente",
          });
        } else {
          // Crear nuevo documento si no existe
          await update(docRef, {
            url: storageUrl + "/" + file.name,
            estadoArchivo: "pendiente",
          });
        }
        console.log("Base de datos actualizada con la nueva URL");
      } catch (dbError) {
        console.error("Error al actualizar la base de datos:", dbError);
      }

      // 3. Llamar al callback siempre
      onFileUploaded();
    } catch (error) {
      console.log("Error al subir el archivo", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label
        className={`cursor-pointer ${
          isUploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="bg-[#2d4583] hover:bg-[#08b177]  text-white p-8 rounded-lg inline-block mb-2">
          <Upload size={32} />
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
      {isUploading && <p className="text-gray-500 mt-2">Subiendo archivo...</p>}
    </div>
  );
};

export default Uploader;
