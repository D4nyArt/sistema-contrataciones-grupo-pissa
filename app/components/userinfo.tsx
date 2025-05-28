"use client";

import ListInformation from "@/app/components/usuario-phone";
import Usuarios from "@/app/components/usuario";
import ExpedienteRH from "@/app/components/expedienteRH";
import React, { useEffect, useState } from "react";
import ContractsPage from "@/app/components/contractsPage";
import { useRouter, useSearchParams } from "next/navigation";
import InfoPerfil from "./informacionPerfil";

export default function UserInfo({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [active, setActive] = useState<"información" | "expediente" | "contratos"> ("información");

  useEffect(() => {
      if (tabParam === "contratos" || tabParam === "expediente" || tabParam === "información") {
        setActive(tabParam);
      }
    }, [tabParam]);
  
    const handleTabChange = (tab: "información" | "expediente" | "contratos") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`?${params.toString()}`);
      setActive(tab);
    };

  return (
    <div>
      <div className="hidden md:block">
        <Usuarios />
      </div>
      <div className="block md:hidden">
        <ListInformation />
      </div>
      <div className="space-x-6 items-center">
        <div className="space-x-6 border-b border-gray-300 items-center mb-6">
        <button
            onClick={() => handleTabChange("información")}
            className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
              active === "información"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Información
          </button>
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

        {active === "contratos" && <ContractsPage uid={id} />}
        {active === "expediente" && <ExpedienteRH userId={id} />}
        {active === "información" && ( <InfoPerfil />
        )}
      </div>
    </div>
  );
}
