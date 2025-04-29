'use client';

import React, { useState, useEffect } from 'react';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, update } from 'firebase/database';
import { storage, database, auth } from '../../firebaseConfig';
import PdfModal from '@/app/components/OnboardingModal';

interface OnboardingCardProps {
  fileName: string;
  folder?: string;
}

export default function OnboardingCard({
  fileName,
  folder = "pruebaInicial/DocsOnboarding",
}: OnboardingCardProps) {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construir la ruta completa del archivo
  const filePath = `${folder}/${fileName}`;

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

  const handleView = () => {
    if (pdfUrl) setShowPdf(true);
    else alert("Espera a que termine de cargar");
  };

  const handleCloseModal = () => {
    setShowPdf(false);
  };

  // 🚀 callback para marcar como aceptado en /Onboarding/Onb{uid}/{docKey}
  const handleAccept = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const docKey = fileName.replace(/\.[^.]+$/, '');
    const rootRef = dbRef(database, `onboarding/Onb${user.uid}`);
    // 1) aseguramos el nodo raíz con el UID
    await update(rootRef, { uid: user.uid });
    // 2) marcamos este documento
    const docRef = dbRef(database, `onboarding/Onb${user.uid}/${docKey}`);
    await update(docRef, { accepted: true, acceptedAt: Date.now() });
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={handleView}
        className="bg-blue-900 text-white p-4 rounded-lg inline-block"
        disabled={loading || !!error}
      >
        <span className="max-w-xs truncate" title={fileName}>{fileName}</span>
      </button>
      {loading && <span className="text-gray-500 text-sm">Cargando...</span>}
      {error && <span className="text-red-500 text-sm">{error}</span>}

      {showPdf && pdfUrl && (
        <PdfModal
          pdfUrl={pdfUrl}
          onClose={handleCloseModal}
          onAccept={handleAccept}
        />
      )}
    </div>
  );
}