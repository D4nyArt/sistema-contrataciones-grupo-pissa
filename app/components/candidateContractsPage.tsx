"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import ManagerViewer from "./ManagerViewer";
import { update, ref as dbRef, get } from "firebase/database";
import { storage, database } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import { Clock, ThumbsUp, ThumbsDown, X, Upload } from "lucide-react";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import sendEmailNotification from "@/app/components/sendEmailNotification";
import PopUp from "./pop-up";

type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

const stateMap: Record<
  ContractState,
  {
    Icon: React.FC<{ size?: number; className?: string }>;
    text: string;
    color: string;
  }
> = {
  revisando: { Icon: Clock, text: "En revisión", color: "text-blue-600" },
  no_firmado: { Icon: X, text: "Contrato no firmado", color: "text-gray-600" },
  aprobado: {
    Icon: ThumbsUp,
    text: "Contrato aprobado",
    color: "text-green-600",
  },
  rechazado: {
    Icon: ThumbsDown,
    text: "Contrato rechazado",
    color: "text-red-600",
  },
};

export default function CandidateContractsPage({ uid }: { uid: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [contract, setContract] = useState<{
    id: string;
    name: string;
    url: string;
    folder: string;
    state: ContractState;
    duration: number;
    notes: string;
  } | null>(null);

  const [dbPath, setDbPath] = useState<string>("");

  const [reviewer, setReviewer] = useState<
    | {
        rID: string;
      }
    | "sin_revisor"
  >("sin_revisor");

  useEffect(() => {
    async function load() {
      // fetch contract info
      const res = await fetch(`/api/getContractInformation?uid=${uid}`);
      const data = await res.json();

      if (data.contract) {
        const { id, name, url, folder } = data.contract;
        setContract({
          id,
          name,
          url,
          folder,
          state: data.state,
          notes: data.notes,
          duration: data.duration,
        });
      } else {
        setContract(null);
      }

      // fetch reviewer
      const rev = await fetch(`/api/getReviewer?uid=${uid}`).then((r) =>
        r.json()
      );
      setReviewer(rev.revisorUID ? { rID: rev.revisorUID } : "sin_revisor");
    }
    load();
  }, [uid]);

  // 2) compute dbPath whenever contract changes
  useEffect(() => {
    if (!contract) {
      setDbPath("");
      return;
    }

    // 3) set dbPath based on contract id (STATIC: candidate always sees the contract template)
    setDbPath(`expedientes/expediente${uid}/contratos/preview`);
  }, [contract]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contract) {
      return;
    }

    // Subir archivo
    const fileName = file.name;
    setIsUploading(true);
    try {
      const fileReference = storageRef(
        storage,
        `pruebaInicial/expedientes/expediente${uid}/contratos/contratoFirmado${uid}`
      );
      const snapshot = await uploadBytes(fileReference, file);
    } finally {
      setIsUploading(false);
    }

    // Expiracion
    const now = new Date();
    const signedDate = now.toISOString();
    const expiration = new Date(now);
    expiration.setMonth(expiration.getMonth() + contract.duration);
    const expirationDate = expiration.toISOString();

    await update(dbRef(database, `usuarios/${uid}`), {
      contrato_activo: fileName,
    });
    await update(dbRef(database, `expedientes/expediente${uid}/contratos`), {
      contrato_activo: fileName,
      estado: "revisando",
      fecha_firmado: signedDate,
      fecha_vencimiento: expirationDate,
      url: `pruebaInicial/expedientes/expediente${uid}/contratos/contratoFirmado${uid}`,
    });

    setContract((prev) =>
      prev
        ? {
            ...prev,
            state: "revisando",
          }
        : null
    );

    // Show success popup
    setShowSuccessPopup(true);

    // Notificaciones
    let nombre = uid; // Valor por defecto en caso de error
    try {
      const nombreSnap = await get(dbRef(database, `usuarios/${uid}/nombre`));
      if (nombreSnap.exists()) {
        nombre = nombreSnap.val();
      }
    } catch (error) {
      console.error("Error al obtener el nombre del candidato:", error);
    }

    const message = `El candidato ${nombre} subió el contrato "${fileName}"`;
    const timestamp = Date.now();

    if (reviewer === "sin_revisor") {
      // enviar a todos los RH
      const usersSnap = await get(dbRef(database, "usuarios"));
      if (usersSnap.exists()) {
        const allUsers = usersSnap.val() as Record<string, { rol?: string }>;
        for (const [userId, userData] of Object.entries(allUsers)) {
          if (userData.rol === "rh") {
            await update(
              dbRef(database, `notificaciones/notificaciones${userId}`),
              {
                [timestamp]: {
                  mensaje: message,
                  leido: false,
                  ruta: `dashboard/${uid}?tab=contratos`,
                  fijado: false,
                },
              }
            );

            // Notificación por email a personal RH
            await sendEmailNotification(
              userId,
              `Nuevo contrato subido por ${nombre}`,
              `Hola,\n\n${message}".\n\nPuedes revisar el contrato ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
            );
          }
        }
      }
    } else {
      await update(
        dbRef(database, `notificaciones/notificaciones${reviewer.rID}`),
        {
          [timestamp]: {
            mensaje: message,
            leido: false,
            ruta: `dashboard/${uid}?tab=contratos`,
            fijado: false,
          },
        }
      );

      // Notificación por email al revisor
      await sendEmailNotification(
        reviewer.rID,
        `Nuevo contrato subido por ${nombre}`,
        `Hola,\n\n${message}".\n\nPuedes revisar el contrato ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
      );
    }
  };

  if (!contract) {
    return <p className="text-gray-500">Estado del contrato no disponible</p>;
  }

  const current = contract.state ? stateMap[contract.state] : null;

  return (
    <div className="mb-12 bg-white p-4 rounded-xl shadow-md">
      {/* Aquí es donde se ve el estado del contrato */}
      {current && (
        <div className={`flex items-center ${current.color} `}>
          <current.Icon size={20} className="mr-2" />
          <span>{current.text}</span>
        </div>
      )}
      {/* Aquí es donde se ven las notas si tiene notas */}
      {contract.notes && (
        <div className="flex items-center text-gray-500 mt-2">
          <p>Notas: </p>
          <span>{contract.notes}</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg shadow-md">
        {/*Aquí es donde se ve el archivo*/}
        <h2
          className={`${urbanist.className} mt-4 text-2xl font-semibold mb-4`}
        >
          Contrato asignado
        </h2>
      </div>
      <div>
        <ManagerViewer userRole="rh" dbPath={dbPath} />
      </div>
      <div>
        <h2
          className={`${urbanist.className} mt-4 text-2xl font-semibold mb-4`}
        >
          Subir nuevo contrato
        </h2>
        {/*Aquí es donde se sube un archivo*/}
        <label className={isUploading ? "opacity-50 pointer-events-none" : ""}>
          <div className="cursor-pointer bg-[#2d4583] hover:bg-[#08b177] text-white p-8 rounded-lg mb-2">
            <Upload size={32} />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading && <p className="text-gray-500">Subiendo archivo...</p>}
        </label>
      </div>

      {/* Success Popup */}
      <PopUp show={showSuccessPopup} onClose={() => setShowSuccessPopup(false)}>
        <div className="text-center">
          <div className="text-green-600 mb-4">
            <ThumbsUp size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">¡Éxito!</h3>
          <p className="text-gray-700">
            El contrato se ha subido correctamente
          </p>
        </div>
      </PopUp>
    </div>
  );
}
