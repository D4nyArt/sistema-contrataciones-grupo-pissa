import React, { useState, useEffect } from "react";
import { Eye, Trash } from "lucide-react";
import {
  ref as storageRef,
  deleteObject,
} from "firebase/storage";
import {
  ref as dbRef,
  update,
  get
} from "firebase/database";
import {storage, database} from "@/firebaseConfig";
import PdfModal from "@/app/components/FileModal";

interface ManagerViewerProps {
  dbPath: string;
  onFileDeleted?: () => void;
  userRole?: string;
}

export default function ManagerViewer({
  dbPath,
  onFileDeleted,
  userRole = "candidato",
}: ManagerViewerProps) {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbPath) return;
    const fetchPdfUrl = async () => {
      try {
        setLoading(true);
        // 1) Leer de RTDB el valor guardado en “dbPath/url”
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
        // 2) Obtener la URL de descarga desde Storage
        //const downloadUrl = await getDownloadURL(storageRef(storage, pathInStorage));
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

  const handleView = () => {
    if (pdfUrl) setShowPdf(true);
    else alert("Espera a que el documento termine de cargar");
  };

  const handleCloseModal = () => setShowPdf(false);

  const handleDeleteFile = async () => {
    try {
      // 1) Borrar de Storage usando filePath
      const fileReference = storageRef(storage, filePath);
      await deleteObject(fileReference);

      // 2) Limpiar RTDB en dbPath/url y estadoArchivo
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
      <button
        onClick={handleView}
        className="bg-blue-900 text-white p-4 rounded-lg cursor-pointer"
        disabled={loading || !!error}
      >
        <Eye size={32} />
      </button>

      <span className="max-w-xs truncate" title={filePath.split("/").pop()}>
        {filePath.split("/").pop()}
      </span>

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
