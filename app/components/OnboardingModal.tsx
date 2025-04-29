'use client';
import React, { useState } from 'react';

interface PdfModalProps {
  pdfUrl: string;
  onClose: () => void;
  onAccept: () => Promise<void>;
}

export default function PdfModal({ pdfUrl, onClose, onAccept }: PdfModalProps) {
  const [loadingAccept, setLoadingAccept] = useState(false);

  async function handleAcceptClick() {
    setLoadingAccept(true);
    try {
      await onAccept();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccept(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Visualizador de PDF</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
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
        
        <div className="mt-4 flex flex-col items-end">
          <p className="mb-2 text-sm text-gray-700">
            Haga clic en “Aceptar” para confirmar que ha leído este documento.
          </p>
          <button
            onClick={handleAcceptClick}
            disabled={loadingAccept}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loadingAccept ? 'Procesando…' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}