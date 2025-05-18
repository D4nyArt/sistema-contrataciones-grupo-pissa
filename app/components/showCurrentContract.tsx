"use client";

import { FileUser } from "lucide-react";
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
    <div className="mt-4 mb-4 p-4 bg-white rounded-xl flex flex-row items-center space-x-4 shadow-sm md:w-1/3">
      <div className="">
        <FileUser className="size-12 text-[#2975a0]" />
      </div>
      {activeContract ? (
        <div className="flex-col flex">
          <p className="text-[#212529]">{activeContract}</p>
          {userRole === "candidato" ? (
            <p className="text-[#495057] text-sm">Contrato en revisión</p>
          ) : (
            <p className="text-[#08b177]">Contrato Activo</p>
          )}
        </div>
      ) : (
        <span className="text-gray-500">
          Este usuario no tiene contratos asignados
        </span>
      )}
    </div>
  );
}
