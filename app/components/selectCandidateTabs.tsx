"use client";

import { useState } from "react";

import ExpedienteCandidato from "@/app/components/expedienteCandidato";
import CandidateContractsPage from "@/app/components/candidateContractsPage";

export default function SelectCandidateTab({ userID }: { userID: string }) {
  const [active, setActive] = useState<"expediente" | "contratos">(
    "expediente"
  );
  return (
    <div className="space-x-6 items-center">
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

      {/*Aquí se cambian las pestañas del candidato entre expediente y contratos*/}
      {active === "contratos" && <CandidateContractsPage uid={userID ?? ""} />}
      {active === "expediente" && (
        <ExpedienteCandidato userId={userID} role="candidate" />
      )}
    </div>
  );
}
