"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";

export default function ShowCurrentContract({ uid }: { uid: string }) {
  const [activeContract, setActiveContract] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveContract = async () => {
      try {
        // Esto obtiene el id del contrato activo del usuario como conproy0, concorp0, etc."
        const userSnap = await get(
          ref(database, `expedientes/expediente${uid}/contratos/id`)
        );
        const contractId = userSnap.val();

        const roleSnap = await get(ref(database, `usuarios/${uid}/rol`));
        const role = roleSnap.val();
        setUserRole(role);

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
      {/*Si el rol del usuario es candidato, significa que no ha sido revisado su documento
      por lo que muestra el mensaje de "Contrato en revisión". Este rol se actualiza en reviewContract.tsx*/}
      {activeContract ? (
        <span className="font-semibold">
          {userRole === "candidato"
            ? "Contrato en revisión: "
            : "Contrato Activo: "}
          {activeContract}
        </span>
      ) : (
        <span className="text-gray-500">
          Este usuario no tiene contratos asignados
        </span>
      )}
    </div>
  );
}
