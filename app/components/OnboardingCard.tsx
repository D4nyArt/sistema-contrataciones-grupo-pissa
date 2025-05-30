'use client';

import React, { useState, useEffect } from 'react';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, update, get } from 'firebase/database';
import { storage, database, auth } from '../../firebaseConfig';
import PdfModal from '@/app/components/OnboardingModal';
import { File, CheckCircle } from "lucide-react";

interface OnboardingCardProps {
  key: string;
  url: string;
  nombre: string;
  type: string;
}

export default function OnboardingCard({
  key,
  url,
  nombre,
  type
}: OnboardingCardProps) {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  // Nuevo estado para aceptación
  const [accepted, setAccepted] = useState<boolean>(false);
  const filePath = url;

  // 1) Traer URL del PDF
  useEffect(() => {
    const fetchPdfUrl = async () => {
      console.log("type: ", type)
      try {
        setLoading(true);
        const url = type == "file" ? await getDownloadURL(storageRef(storage, filePath)) : filePath;
        setPdfUrl(url);
      } catch (err) {
        console.error("Error al obtener URL de descarga:", err);
        if (type != "file") setError("No se pudo cargar el PDF");
      } finally {
        setLoading(false);
      }
    };
    fetchPdfUrl();
  }, [filePath]);

  // 2) Al montar, revisar si ya existe entrada de aceptación en RTDB
  useEffect(() => {
    const checkAccepted = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = dbRef(database, `onboarding/Onb${user.uid}/${nombre}`);
      const snap = await get(docRef);
      if (snap.exists()) {
        const data = snap.val() as { accepted: boolean; acceptedAt?: number };
        setAccepted(!!data.accepted);
        setAccepted(!!data.acceptedAt);
        // inicializar nodo
        await update(docRef, { accepted: false, acceptedAt: null });
      }
    };
    checkAccepted();
  }, [nombre]);

  const handleView = () => {
    if (pdfUrl) setShowPdf(true);
    else alert("Espera a que termine de cargar");
  };

  const handleCloseModal = () => {
    setShowPdf(false);
  };

  // 3) callback para marcar como aceptado
  const handleAccept = async () => {
    
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const docRef = dbRef(database, `onboarding/Onb${user.uid}/${nombre}`);
    const now = Date.now(); 
    await update(docRef, { accepted: true, acceptedAt: now });
    
    setAccepted(true);
  };
  return (
    <>
    {
    <div className="flex items-center justify-between space-x-2 p-2 border rounded">
      <div onClick={handleView} className="flex items-center space-x-1 cursor-pointer">
        {accepted
          ? <CheckCircle className="text-green-600" />
          : <File />}
        <span className="truncate max-w-xs" title={nombre} key={key}>{nombre}</span>
      </div>

      {loading && <span className="text-gray-500 text-sm">Cargando...</span>}
      {error && <span className="text-red-500 text-sm">{error}</span>}
      
      {showPdf && pdfUrl && (
        <PdfModal
          pdfUrl={pdfUrl}
          onClose={handleCloseModal}
          onAccept={handleAccept}
          type={type}
        />
      )}
    </div>
}
    </>
  );
}