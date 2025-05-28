"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import CandidateContractsPage from "@/app/components/candidateContractsPage";
import ExpedienteCandidato from "@/app/components/expedienteCandidato";

export default function SelectCandidateTab({ userID }: { userID: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [active, setActive] = useState<"expediente" | "contratos">(
    "expediente"
  );

  useEffect(() => {
    if (tabParam === "contratos" || tabParam === "expediente") {
      setActive(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "expediente" | "contratos") => {
    router.push(`?tab=${tab}`);
    setActive(tab);
  };

  return (
    <div className="space-x-6 items-center">
      <div className="border-b space-x-6 mb-6 border-gray-300 w-full">
        <button
          onClick={() => handleTabChange("expediente")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            active === "expediente"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Expediente
        </button>

        <button
          onClick={() => handleTabChange("contratos")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            active === "contratos"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Contratos
        </button>
      </div>

      {active === "contratos" && <CandidateContractsPage uid={userID} />}
      {active === "expediente" && <ExpedienteCandidato userId={userID} />}
    </div>
  );
}
