"use client";

import { useEffect, useState } from "react";

export default function ShowCurrentContract({ uid }: { uid: string }) {
  const [activeContract, setActiveContract] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      const res = await fetch(`/api/getContractInformation?uid=${uid}`);
      const data = await res.json();
      if (data.contract) {
        setActiveContract(data.contract.name);
      }
      setUserRole(data.role);
    }
    fetchInfo();
  }, [uid]);

  return (
    <div className="mb-4 p-4">
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
