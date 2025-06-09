import { useEffect, useState } from "react";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { storage } from "@/firebaseConfig";

interface DirectViewerProps {
    urlDb: string;
}

export default function BetterDirectFileViewer({urlDb}: DirectViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const url = await getDownloadURL(storageRef(storage, urlDb));
        setPdfUrl(url);
      } catch (err) {
        console.error("Error al obtener URL de descarga:", err);
      }
    };

    fetchPdfUrl();
  }, [urlDb]);

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-[50vh] md:h-full rounded-xl shadow-md"
      allowFullScreen
    ></iframe>
  );
}
