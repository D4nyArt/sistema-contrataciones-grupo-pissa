"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";

export default function ShowCurrentContract({ uid }: { uid: string }) {
  const [activeContract, setActiveContract] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveContract = async () => {
      try {
        // Esto obtiene el id del contrato activo del usuario como conproy0, concorp0, etc."
        const userSnap = await get(
          ref(database, `expedientes/expediente${uid}/contratos/id`)
        );
        const contractId = userSnap.val();

        // Esto separa entre el contrato de corporativo y el de proyectos
        let path = "";
        if (contractId.startsWith("conproy")) {
          path = `contratos/proyectos/${contractId}`;
        } else if (contractId.startsWith("concorp")) {
          path = `contratos/corporativo/${contractId}`;
        } else {
          return;
        }

        // Esto obtiene el nombre del contrato activo del usuario que está como contractID
        const contractSnap = await get(ref(database, path));
        if (contractSnap.exists()) {
          const data = contractSnap.val();
          setActiveContract(data.name);
        }
      } catch (error) {
        console.error("Error obteniendo el contrato activo:", error);
      }
    };
    fetchActiveContract();
  }, [uid]);

  return (
    <div className="mb-4 p-4">
      {/*Si tiene contrato activo, lo muestra, si no muestra mensaje*/}
      {activeContract ? (
        <span className="font-semibold">Contrato activo: {activeContract}</span>
      ) : (
        <span className="text-gray-500">
          Este usuario no tiene contratos asignados
        </span>
      )}
    </div>
  );
}
