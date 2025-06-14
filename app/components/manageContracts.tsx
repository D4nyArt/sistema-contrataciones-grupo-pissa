import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import ContractSendAndPreview from "./contractSendAndPreview";
import ReviewContract from "./reviewContract";

export default function ManageContracts({ uid }: { uid: string }) {
  const [hasCompleteExpediente, setHasCompleteExpediente] = useState<
    boolean | null
  >(null);

  // Revisa si el usuario tiene un expediente completo
  useEffect(() => {
    const checkExpediente = async () => {
      try {
        const snap = await get(
          ref(database, `expedientes/expediente${uid}/expediente_completo`)
        );
        setHasCompleteExpediente(snap.exists() ? snap.val() : false);
      } catch (error) {
        console.error("Error checking expediente:", error);
        setHasCompleteExpediente(false);
      }
    };

    checkExpediente();
  }, [uid]);

  // No permitir enviar contrato si no tiene expediente completo
  if (!hasCompleteExpediente) {
    return (
      <div className="text-red-500 text-center p-4 rounded-lg bg-red-50 border border-red-200">
        <p>
          No se puede enviar un contrato. El usuario no tiene un expediente
          completo.
        </p>
      </div>
    );
  }
  return (
    <>
      <div>
        <ContractSendAndPreview uid={uid} />
      </div>
      <div>
        <ReviewContract uid={uid} />
      </div>
    </>
  );
}
