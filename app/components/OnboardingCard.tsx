"use client";

import React, { useState, useEffect } from "react";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { ref, update, get } from "firebase/database";
import { storage, database, auth } from "../../firebaseConfig";
import PdfModal from "@/app/components/OnboardingModal";
import { FileText } from "lucide-react";
import { addHistoryEntry } from '../api/history/history';

interface OnboardingCardProps {
  key: string;
  url: string;
  nombre: string;
  type: string;
  reference?: string
}

export default function OnboardingCard({
  key,
  url,
  nombre,
  type,
  reference
}: OnboardingCardProps) {
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);



  // Nuevo estado para aceptación
  //const [accepted, setAccepted] = useState<boolean>(false);
  const filePath = url;

  // 1) Traer URL del PDF
  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        setLoading(true);
        const url =
          type == "file"
            ? await getDownloadURL(storageRef(storage, filePath))
            : filePath;
        setPdfUrl(url);
      } catch (err) {
        console.error("Error al obtener URL de descarga:", err);
        if (type != "file") setError("No se pudo cargar el PDF");
      } finally {
        setLoading(false);
      }
    };
    fetchPdfUrl();
  }, [filePath, type]);

  // 2) Al montar, revisar si ya existe entrada de aceptación en RTDB
  useEffect(() => {
    const checkAccepted = async () => {
      const fetcher = await fetch('/api/getCurrentUserID')
      const jason = await fetcher.json();

      const uid = jason.value;

      const docRef = ref(database, `onboarding/Onb${uid}/${nombre}`);
      const docRefacc = ref(database, `onboarding/Onb${uid}/${nombre}/accepted`);
      const docRefacc_snap = await get(docRefacc);
      setAccepted(docRefacc_snap.val());
      const snap = await get(docRef);

      console.log(snap);

      
      
      
      if (!snap.exists()) {
        //const data = snap.val() as {accepted: boolean; acceptedAt?: number};
        //setAccepted(!!data.accepted);
        //setAccepted(!!data.acceptedAt);
        // inicializar nodo
        await update(docRef, {accepted: false, acceptedAt: null});
        }
      
    };
    checkAccepted();
  }, [nombre, accepted]);

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
    //const docRef = ref(database, `usuarios/Onb${user.uid}/${nombre}`);

    if(reference) {
      const onbRef = ref(database, `${reference}/${nombre}`);
      const now = Date.now();
      await update(onbRef, {accepted: true, acceptedAt: now});
      setAccepted(true); 

      }
    //await update(docRef, {accepted: true, acceptedAt: now});
    //setAccepted(true);
  };
  return (
    <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
      <div
        onClick={handleView}
        className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40 bg-gradient-to-r from-blue-200 to-blue-100 items-center flex justify-center"
      >
        <FileText className="size-15 text-[#2d4583]" />
      </div>
      <div className="p-6">
        <h5
          className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased"
          title={nombre}
          key={key}
        >
          {nombre}
        </h5>
        {accepted ? (
          <p className="text-green-600 mb-2"> Completado </p>
        ) : (
          <div>
            <span></span>
            <p className="mb-2">Pendiente</p>
          </div>
        )}
        <button
          onClick={handleView}
          data-ripple-light="true"
          className="select-none rounded-lg bg-[#2d4583] hover:bg-[#08b177] py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer"
        >
          Leer
        </button>
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
  );
}
