import { useEffect, useState } from "react";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { storage } from "@/firebaseConfig";

interface DirectViewerProps {
  expedienteId?: string;
  documentoId?: string;
  fileName: string;
  folder?: string;
  userRole?: string;
  contrato?: boolean;
}

export default function DirectViewer({
  expedienteId,
  documentoId,
  fileName,
  folder = "pruebaInicial",
  userRole = "candidato", // Valor por defecto "candidato"
  contrato,
}: DirectViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

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

    useEffect(() => {
      const fetchPdfUrl = async () => {
        try {
          const url = await getDownloadURL(storageRef(storage, filePath));
          setPdfUrl(url);
        } catch (err) {
          console.error("Error al obtener URL de descarga:", err);
        }
      };
  
      fetchPdfUrl();
    }, [filePath]);

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-[50vh] md:h-full rounded-xl shadow-md"
      allowFullScreen
    ></iframe>
  );
}
