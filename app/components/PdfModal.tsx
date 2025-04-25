"use client";

import React from "react";

interface PdfModalProps {
  pdfUrl: string; // Cambiado de filePath a pdfUrl
  onClose: () => void;
}

export default function PdfModal({ pdfUrl, onClose }: PdfModalProps): any {
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
          <a
            href={pdfUrl}
            download
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Descargar PDF
          </a>
        </div>
      </div>
    </div>
  );
}
