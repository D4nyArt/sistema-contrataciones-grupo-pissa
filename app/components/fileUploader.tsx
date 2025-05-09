"use client";
import { useDropzone } from "react-dropzone";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, update, get } from "firebase/database";
import React, { useRef, useState, useCallback } from "react";
import { storage, database } from "../../firebaseConfig";
import { Upload } from "lucide-react";

interface UploaderProps {
  expedienteId?: string;
  documentoId?: string;
  onFileUploaded: (fileName: string, snapshot: unknown) => void;
  folder?: string;
  contrato?: boolean;
}

const Uploader: React.FC<UploaderProps> = ({
  expedienteId,
  documentoId,
  onFileUploaded,
  folder = "pruebaInicial",
  contrato = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);

    try {
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

      if (expedienteId && documentoId) {
        const docRef = dbRef(
          database,
          `expedientes/${expedienteId}/documentos/${documentoId}`
        );
        const docSnapshot = await get(docRef);

        if (docSnapshot.exists()) {
          await update(docRef, {
            url: filePath,
            estadoGeneral: "pendiente_de_revisar",
            estadoArchivo: "pendiente_de_revisar",
          });
        } else {
          await update(docRef, {
            url: filePath,
            estado: "pendiente_de_revisar",
            estadoGeneral: "pendiente_de_revisar",
            estadoArchivo: "pendiente_de_revisar",
            campos: {},
          });
        }
      }

      onFileUploaded(file.name, snapshot);
    } catch (error) {
      console.error("Error al subir el archivo", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div {...getRootProps()} className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
      <input {...getInputProps()} disabled={isUploading} />
      <div className="flex flex-col items-center justify-center">
        <div className="bg-[#2d4583] hover:bg-[#08b177] text-white p-4 rounded-full mb-2">
          <Upload size={32} />
        </div>
        {isDragActive ? (
          <p className="text-sm">Suelta el archivo aquí...</p>
        ) : (
          <p className="text-sm">
            Arrastra un archivo PDF aquí o haz clic para seleccionarlo
          </p>
        )}
        {isUploading && <p className="text-gray-500 mt-2">Subiendo archivo...</p>}
      </div>
    </div>
  );
};

export default Uploader;