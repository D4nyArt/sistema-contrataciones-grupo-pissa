"use client";
import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import React, {useCallback, useState, useEffect} from "react";

interface PdfModalProps {
  pdfUrl: string;
  onClose: () => void;
}

export default function PdfModal({
  pdfUrl,
  onClose,
}: PdfModalProps): React.ReactElement {
  const [downloadableUrl, setDownloadableUrl] = useState<string>("");

  // Obtenemos el URL público de descarga de Firebase Storage
  useEffect(() => {
    async function fetchDownloadUrl() {
      try {
        const storage = getStorage();
        const ref = storageRef(storage, pdfUrl);
        const url = await getDownloadURL(ref);
        setDownloadableUrl(url);
      } catch (e) {
        console.error("No se pudo obtener el downloadURL:", e);
      }
    }
    fetchDownloadUrl();
  }, [pdfUrl]);

  const handleDownload = useCallback(async () => {
    if (!downloadableUrl) return;
    try {
      // Usamos nuestro API route para evitar CORS y obtener el Content-Disposition
      const res = await fetch(
        `/api/downloadPdf?path=${encodeURIComponent(pdfUrl)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      // El filename ya viene en la cabecera Content-Disposition de la API
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error descargando el archivo:", err);
    }
  }, [pdfUrl, downloadableUrl]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Visualizador de PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="w-full h-[80vh]">
          <iframe
            src={pdfUrl}
            className="w-full h-full border"
            allowFullScreen
          ></iframe>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}