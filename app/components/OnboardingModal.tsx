'use client';
import React, { useState } from 'react';
import Image from "next/image";
import { urbanist } from "@/app/components/fonts";


interface PdfModalProps {
  pdfUrl: string;
  type: string;
  onClose: () => void;
  onAccept: () => Promise<void>;
}

export default function PdfModal({ pdfUrl, type, onClose, onAccept }: PdfModalProps) {
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
        { type == "file" ? 
        <div className="w-full h-[80vh]">
          <iframe 
            src={pdfUrl}
            className="w-full h-full border"
            allowFullScreen
          ></iframe>
        </div>
        :
        <div className="bg-[#2d4583] md:bg-white h-screen p-8 md:flex md:justify-center md:items-center">
      <div className="bg-white md:bg-white p-8 rounded-xl shadow-lg w-full md:w-1/2 flex flex-col items-center gap-6">
        <Image
          src="/logo_pissa.png"
          alt="Logo"
          width={100}
          height={60}
          className="hidden md:block"
        />
        <h2
          className={`text-2xl md:text-3xl font-bold text-black ${urbanist.className}`}
        >
          Onboarding Link
        </h2>
        <p className="text-black text-center">
          Accede al link para este apartado de onboarding
          
        </p>
        <div className="mt-4 flex flex-col items-end">
          <a href={pdfUrl} target="_blank" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Acceder
          </a>
        </div>  
      </div>
      </div>
        }
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