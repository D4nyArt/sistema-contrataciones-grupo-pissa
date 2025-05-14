"use client";

import ListInformation from "@/app/components/usuario-phone";
import Usuarios from "@/app/components/usuario";
import ExpedienteRH from "@/app/components/expedienteRH";
import React, { useState } from "react";
import ContractsPage from "@/app/components/contractsPage";

export default function UserInfo({ id }: { id: string }) {
  const [active, setActive] = useState<"expediente" | "contratos">(
    "expediente"
  );

  return (
    <div>
      <div className="hidden md:block">
        <Usuarios />
      </div>
      <div className="block md:hidden">
        <ListInformation />
      </div>

      <div className="">
        <div className="space-x-6 border-b border-gray-300 items-center mb-6">
          <button
            onClick={() => setActive("expediente")}
            className={`cursor-pointer pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              active === "expediente"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Expediente
          </button>

          <button
            onClick={() => setActive("contratos")}
            className={`cursor-pointer pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              active === "contratos"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Contratos
          </button>
        </div>

        {active === "contratos" && <ContractsPage uid={id} />}
        {active === "expediente" && (
          <ExpedienteRH userId={id} />
        )}
      </div>
    </div>
  );
}
