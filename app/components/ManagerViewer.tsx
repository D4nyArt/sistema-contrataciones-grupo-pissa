"use client";

import React, { useState, useEffect } from "react";
import { Eye, Trash } from "lucide-react";
import {
  ref as storageRef,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { ref as dbRef, update } from "firebase/database";
import { storage, database } from "../../firebaseConfig";
import PdfModal from "@/app/components/PdfModal";

interface ManagerViewerProps {
  expedienteId?: string;
  documentoId?: string;
  fileName: string;
  onFileDeleted?: () => void;
  folder?: string;
  userRole?: string; // Prop opcional para el rol
  contrato?: boolean;
}

export default function ManagerViewer({
  expedienteId,
  documentoId,
  fileName,
  onFileDeleted,
  folder = "pruebaInicial",
  userRole = "candidato", // Valor por defecto "candidato"
  contrato,
}: ManagerViewerProps) {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construir la ruta completa del archivo
  let filePath = "";
  if (contrato) {
    if (userRole === "candidato") {
      filePath = `${folder}/${fileName}`;
    } else filePath = `${folder}/${expedienteId}/Contratos/${fileName}`;
  } else {
    filePath =
      expedienteId && documentoId
        ? `${folder}/${expedienteId}/${documentoId}/${fileName}`
        : `${folder}/${fileName}`;
  }

  // console.log("Ruta del archivo:", filePath);

  // Obtener la URL de descarga cuando el componente se monta
  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        setLoading(true);
        const url = await getDownloadURL(storageRef(storage, filePath));
        setPdfUrl(url);
      } catch (err) {
        console.error("Error al obtener URL de descarga:", err);
        setError("No se pudo cargar el PDF");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();
  }, [filePath]);

  // Al pulsar el botón "ver", se abre el PdfModal con la URL obtenida
  const handleView = () => {
    if (pdfUrl) {
      setShowPdf(true);
    } else {
      alert("Espera a que el documento termine de cargar");
    }
  };

  // Cierra el PdfModal
  const handleCloseModal = () => {
    setShowPdf(false);
  };

  // Se borra el archivo de Firebase Storage y se actualiza la BD
  const handleDeleteFile = async () => {
    try {
      // 1. Borrar el archivo de Firebase Storage
      const fileReference = storageRef(storage, filePath);
      await deleteObject(fileReference);
      console.log("Archivo eliminado de Storage:", filePath);

      // 2. Actualizar la base de datos si se proporcionaron expedienteId y documentoId
      if (expedienteId && documentoId) {
        const docRef = dbRef(
          database,
          `expedientes/${expedienteId}/documentos/${documentoId}`
        );

        await update(docRef, {
          url: "",
          estadoArchivo: "no_subido",
          estadoGeneral: "no_subido",
        });

        console.log(
          "Base de datos actualizada: se eliminó la referencia al archivo"
        );
      }

      // 3. Ejecutar la callback si existe
      if (onFileDeleted) {
        onFileDeleted();
      }
    } catch (err) {
      console.error("Error al eliminar el archivo:", err);
      alert("Ocurrió un error al eliminar el archivo");
    }
  };
  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={handleView}
        className="bg-blue-900 text-white p-4 rounded-lg inline-block cursor-pointer"
        disabled={loading || !!error}
      >
        <Eye size={32} />
      </button>

      <span className="max-w-xs truncate" title={fileName}>
        {fileName}
      </span>

      {/* Renderizar el botón de eliminar solo si el rol es "candidato" */}
      {userRole === "candidato" && (
        <button
          onClick={handleDeleteFile}
          className="text-red-500 hover:text-red-700"
          disabled={loading}
        >
          <Trash size={24} />
        </button>
      )}

      {loading && <span className="text-gray-500 text-sm">Cargando...</span>}
      {error && <span className="text-red-500 text-sm">{error}</span>}

      {showPdf && pdfUrl && (
        <PdfModal pdfUrl={pdfUrl} onClose={handleCloseModal} />
      )}
    </div>
  );
}
