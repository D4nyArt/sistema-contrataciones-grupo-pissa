"use client";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, update, get } from "firebase/database";
import React, { useRef, useState } from "react";
import { storage, database } from "../../firebaseConfig";
import { Upload } from "lucide-react";

// Definimos las props que puede recibir Uploader
interface UploaderProps {
  expedienteId?: string; // Opcional: ID del expediente
  documentoId?: string; // Opcional: ID del documento
  onFileUploaded: (fileName: string, snapshot: unknown) => void;
  folder?: string; // Carpeta personalizada (opcional)
  contrato?: boolean; // Indica si es un contrato
}

const Uploader: React.FC<UploaderProps> = ({
  expedienteId,
  documentoId,
  onFileUploaded,
  folder = "pruebaInicial", // Mantener la carpeta original que usa DocumentManager
  contrato = false,
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
      // Si se proporcionaron expedienteId y documentoId, usar una ruta estructurada
      // Si no, usar la carpeta general
      let filePath =
        expedienteId && documentoId
          ? `${folder}/${expedienteId}/${documentoId}/${file.name}`
          : `${folder}/${file.name}`;

      if (contrato) {
        filePath = `${folder}/${expedienteId}/Contratos/${file.name}`;
      }

      const fileReference = storageRef(storage, filePath);
      const snapshot = await uploadBytes(fileReference, file);
      console.log("Archivo subido correctamente:", snapshot);

      // 2. Si se proporcionaron expedienteId y documentoId, actualizar la BD
      if (expedienteId && documentoId) {
        try {
          // Obtener la URL de descarga una sola vez
          //const downloadUrl = await getDownloadURL(fileReference);

          // Verificar si existe la ruta en la BD
          const docRef = dbRef(
            database,
            `expedientes/${expedienteId}/documentos/${documentoId}`
          );
          const docSnapshot = await get(docRef);

          if (docSnapshot.exists()) {
            // Actualizar documento existente
            await update(docRef, {
              url: filePath, // Guardar la URL general, no la de descarga
              estadoGeneral: "pendiente_de_revisar",
              estadoArchivo: "pendiente_de_revisar",
            });
          } else {
            // Crear nuevo documento si no existe
            await update(docRef, {
              url: filePath,
              estado: "pendiente_de_revisar",
              estadoGeneral: "pendiente_de_revisar",
              estadoArchivo: "pendiente_de_revisar",
              campos: {},
            });
          }
          console.log("Base de datos actualizada con la nueva URL");
        } catch (dbError) {
          console.error("Error al actualizar la base de datos:", dbError);
        }
      }

      // 3. Llamar al callback siempre
      onFileUploaded(file.name, snapshot);
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
        <div className="bg-blue-900 text-white p-8 rounded-lg inline-block mb-2">
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
