"use client";

import ListInformation from "@/app/components/usuario-phone";
import Usuarios from "@/app/components/usuario";
import ExpedienteCandidato from "@/app/components/expedienteCandidato";
import ViewContract from "@/app/components/viewcontract";
import React, { useState } from "react";
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

      <div>
        <button
          onClick={() => setActive("expediente")}
          className={`pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            active === "expediente"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#2d4583]"
          }`}
        >
          Expediente
        </button>

        <button
          onClick={() => setActive("contratos")}
          className={`pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
            active === "contratos"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#2d4583]"
          }`}
        >
          Contratos
        </button>

        {active === "contratos" && <ViewContract contractId="" />}
        {active === "expediente" && (
          <ExpedienteCandidato userId={id} role="admin" />
        )}
      </div>
    </div>
  );
}
