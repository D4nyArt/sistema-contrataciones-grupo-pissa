/**
 * FileModal.tsx
 *
 * Proporciona un modal para visualizar y descargar archivos desde Firebase Storage.
 *
 * Este componente renderiza un modal que puede mostrar tanto archivos PDF como imágenes,
 * adaptando automáticamente el visor según el tipo de archivo. Incluye funcionalidad
 * de descarga directa y manejo de URLs de Firebase Storage para proporcionar una
 * experiencia de visualización completa dentro de la aplicación.
 */

"use client";

import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
} from "firebase/storage";
import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";

/**
 * Define las propiedades del componente PdfModal.
 */
interface PdfModalProps {
  /** La ruta del archivo en Firebase Storage (puede ser PDF o imagen). */
  pdfUrl: string;

  /** Función callback que se ejecuta al cerrar el modal. */
  onClose: () => void;
}

/**
 * Renderiza un modal para visualizar y descargar archivos desde Firebase Storage.
 *
 * Este componente detecta automáticamente el tipo de archivo basándose en su extensión
 * y proporciona el visor apropiado (iframe para PDFs, componente Image para imágenes).
 * Incluye funcionalidad completa de descarga que maneja la obtención de URLs de Firebase
 * Storage y la descarga directa del archivo al dispositivo del usuario.
 *
 * @param props - Las propiedades del componente.
 * @param props.pdfUrl - La ruta del archivo en Firebase Storage.
 * @param props.onClose - Función que se ejecuta al cerrar el modal.
 * @returns El elemento JSX que renderiza el modal de visualización de archivos.
 *
 * @example
 * ```tsx
 * // Modal para visualizar PDF
 * <PdfModal
 *   pdfUrl="expedientes/user123/diploma.pdf"
 *   onClose={() => setModalOpen(false)}
 * />
 *
 * // Modal para visualizar imagen
 * <PdfModal
 *   pdfUrl="expedientes/user123/foto.jpg"
 *   onClose={() => setModalOpen(false)}
 * />
 *
 * // Uso condicional
 * {showFileModal && (
 *   <PdfModal
 *     pdfUrl={selectedFile}
 *     onClose={() => setShowFileModal(false)}
 *   />
 * )}
 * ```
 */
export default function PdfModal({
  pdfUrl,
  onClose,
}: PdfModalProps): React.ReactElement {
  /** Estado que almacena la URL de descarga obtenida desde Firebase Storage. */
  const [downloadableUrl, setDownloadableUrl] = useState<string>("");

  /** Estado que almacena el nombre del archivo extraído de la ruta. */
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    /**
     * Obtiene la URL de descarga del archivo desde Firebase Storage.
     *
     * Esta función consulta Firebase Storage para obtener una URL de descarga
     * válida y extrae el nombre del archivo de la ruta proporcionada.
     */
    async function fetchDownloadUrl() {
      try {
        const storage = getStorage();
        const ref = storageRef(storage, pdfUrl);
        const url = await getDownloadURL(ref);
        setFileName(pdfUrl.split("/").pop() || "archivo");
        setDownloadableUrl(url);
      } catch (e) {
        console.error("No se pudo obtener el downloadURL:", e);
      }
    }
    fetchDownloadUrl();
  }, [pdfUrl]);

  /**
   * Maneja la descarga del archivo al dispositivo del usuario.
   *
   * Esta función utiliza la API de descarga del sistema para obtener el archivo
   * desde Firebase Storage y lo descarga automáticamente al dispositivo del usuario
   * con el nombre original del archivo.
   */
  const handleDownload = useCallback(async () => {
    if (!downloadableUrl) return;
    try {
      const res = await fetch(
        `/api/downloadFile?url=${encodeURIComponent(downloadableUrl)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error descargando el archivo:", err);
    }
  }, [downloadableUrl, fileName]);

  /** Detecta si el archivo es un PDF basándose en su extensión. */
  const isPdf = fileName.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isPdf ? "Visualizador de PDF" : "Visor de Imagen"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="w-full h-[80vh] flex items-center justify-center">
          {downloadableUrl ? (
            isPdf ? (
              <iframe
                src={downloadableUrl}
                className="w-full h-full border"
                allowFullScreen
              />
            ) : (
              <Image
                src={downloadableUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain border"
                width={500}
                height={500}
                unoptimized={true}
                loading="lazy"
                draggable={false}
              />
            )
          ) : (
            <div>Cargando…</div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Descargar {isPdf ? "PDF" : "Imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}
