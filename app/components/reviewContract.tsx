"use client";

import { useState, useEffect } from "react";
import { Clock, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { update, ref } from "firebase/database";
import DirectViewer from "./directFileView";
import { database } from "@/firebaseConfig";
import PopUp from "./pop-up";
import { urbanist } from "./fonts";
import sendEmailNotification from "@/app/components/sendEmailNotification";

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

export default function ReviewContract({ uid }: { uid: string }) {
  const [info, setInfo] = useState<{
    state: ContractState | null;
    contract: { id: string; name: string } | null;
    active_contract: string | null;
  }>({ state: null, contract: null, active_contract: null });

  const [notes, setNotes] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempState, setTempState] = useState<ContractState | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      const res = await fetch(`/api/getContractInformation?uid=${uid}`);
      const data = await res.json();
      setInfo({
        state: data.state,
        contract: data.contract,
        active_contract: data.active_contract,
      });
    }
    fetchInfo();
  }, [uid]);

  const handleContractReview = async (approve: boolean) => {
    if (!info.contract) return;
    const newState: ContractState = approve ? "aprobado" : "rechazado";
    await update(ref(database, `expedientes/expediente${uid}/contratos`), {
      estado: newState,
      notas: notes,
    });

    if (approve) {
      const newRole = info.contract.id.startsWith("conproy")
        ? "enProyecto"
        : "enCorporativo";
      await update(ref(database, `usuarios/${uid}`), { rol: newRole });
    }
    setInfo((cur) => ({ ...cur, state: newState }));
    setNotes("");

    // Notificaciones
    const message = `El contrato subido ha sido ${
      approve ? "aprobado" : "rechazado"
    }. ${notes ? "Tiene nuevas notas." : ""}`;
    const timestamp = Date.now();
    await update(ref(database, `notificaciones/notificaciones${uid}`), {
      [timestamp]: {
        mensaje: message,
        leido: false,
        ruta: `candidato/expediente?tab=contratos`,
        fijado: false,
      },
    });

    // Enviar notificación por email
    await sendEmailNotification(
      uid,
      `Actualización de estado en contrato`,
      `Hola,\n\n${message}"Puedes revisar el estado del contrato ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
    );
  };

  const current = info.state ? stateMap[info.state] : null;

  const handleClick = (approve: boolean) => {
    const newState: ContractState = approve ? "aprobado" : "rechazado";
    setTempState(newState);
    setShowConfirm(true);
  };

  return (
    <div className="space-y-4 bg-white mt-4 rounded-xl shadow-md p-4">
      {current && (
        <div className={`flex items-center ${current.color} `}>
          <current.Icon size={20} className="mr-2" />
          <span>{current.text}</span>
        </div>
      )}

      {/* Vista previa del contrato subido por el candidato */}
      {info.contract ? (
        <DirectViewer
          folder={`pruebaInicial/expedientes/expediente${uid}/Contratos`}
          fileName={info.active_contract ?? "NaC"}
        />
      ) : (
        <p className="text-gray-500">
          Este usuario no ha subido ningún contrato.
        </p>
      )}

      {/* Notas input */}
      <form className="flex flex-col items-start gap-2">
        <label
          htmlFor="admin-notes"
          className={`${urbanist.className} font-semibold`}
        >
          Notas:
        </label>
        <input
          id="admin-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border p-2 rounded-xl border-gray-200"
        />
      </form>

      {/* Botones para aprobar o rechazar */}
      <div className="flex space-x-2 justify-center items-center">
        <button
          onClick={() => handleClick(true)}
          className="p-2 bg-green-500 text-white rounded cursor-pointer"
        >
          <ThumbsUp size={16} className="inline-block mr-1" />
          Aprobar
        </button>
        <button
          onClick={() => handleClick(false)}
          className="p-2 bg-red-500 text-white rounded cursor-pointer"
        >
          <ThumbsDown size={16} className="inline-block mr-1" />
          Rechazar
        </button>
      </div>

      {/* Confirmación de envío */}
      <PopUp show={showConfirm} onClose={() => setShowConfirm(false)}>
        <p>
          ¿Seguro que quieres{" "}
          {tempState === "aprobado" ? "aprobar" : "rechazar"} este contrato?
        </p>
        {notes !== "" && <p className="mt-2 text-gray-500">Notas: {notes}</p>}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              handleContractReview(tempState === "aprobado");
              setShowConfirm(false);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
          >
            Confirmar
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
            }}
            className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </PopUp>
    </div>
  );
}
